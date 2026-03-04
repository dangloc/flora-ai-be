const dotenv = require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser');
const socketIO = require('socket.io');
const http = require('http');
const path = require('path');
const { ADMIN_IDS } = require('./config/adminConfig');


const app = express();
const server = http.createServer(app);
// Socket.IO setup
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(express.json());
app.use(cookieParser())
app.use(bodyParser.raw({ type: 'application/json' }));
app.use(cors())
app.use(fileUpload({
    useTempFiles: true,
}))

// Routes
app.use('/user', require('./routes/userRouter'))
app.use('/api', require('./routes/categoryRouter'))
app.use('/api', require('./routes/upload'))
app.use('/api', require('./routes/productRouter'))
app.use('/api', require('./routes/paymentRouter'))
app.use('/api', require('./routes/bannerRouter'))
app.use('/api', require('./routes/chatRouter'))
app.use('/api/coupon', require('./routes/couponRouter'))
app.use('/api/news', require('./routes/newsRouter'))
app.use('/api/contact', require('./routes/contactRouter'))

// Socket.IO Event Handlers
const onlineUsers = {}; // { userId: socketId }
let mainAdminId = null; // Cache main admin ID

// Function to get main admin từ config
const getMainAdmin = async () => {
  if (mainAdminId) return mainAdminId;
  
  try {
    const mainAdminIdFromConfig = ADMIN_IDS[0];
    if (mainAdminIdFromConfig) {
      mainAdminId = mainAdminIdFromConfig;
      console.log('✅ Main admin from config:', mainAdminId);
      return mainAdminId;
    }
  } catch (err) {
    console.error('❌ Error getting main admin from config:', err);
  }
  return null;
};

io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  // User joined
  socket.on('user-join', (userId) => {
    onlineUsers[userId] = socket.id;
    console.log('User joined:', userId);
    io.emit('users-online', Object.keys(onlineUsers));
  });

  // Message từ user tới admin (ALWAYS TO MAIN ADMIN)
  socket.on('send-message', async (data) => {
    // data: { user_id, admin_id, message }
    const AdminChat = require('./models/adminChatModel');
    const mongoose = require('mongoose');

    try {
      // Validate dữ liệu
      if (!data.user_id || !data.message) {
        console.error('Missing required fields:', { user_id: data.user_id, message: data.message });
        return socket.emit('message-error', { error: 'Thiếu thông tin cần thiết' });
      }

      // Validate user_id
      if (!mongoose.Types.ObjectId.isValid(data.user_id)) {
        console.error('Invalid user_id format:', data.user_id);
        return socket.emit('message-error', { error: 'Invalid user_id' });
      }

      // Force to use main admin
      const adminId = await getMainAdmin();
      if (!adminId) {
        console.error('❌ No main admin found');
        return socket.emit('message-error', { error: 'Admin không khả dụng' });
      }

      console.log('📨 Saving message for user:', data.user_id, 'to main admin:', adminId);

      let chat = await AdminChat.findOne({
        user_id: data.user_id,
        admin_id: adminId
      });

      if (!chat) {
        chat = new AdminChat({
          user_id: data.user_id,
          admin_id: adminId,
          messages: []
        });
      }

      chat.messages.push({
        sender_id: data.user_id,
        sender_type: 'user',
        content: data.message,
        timestamp: new Date()
      });

      await chat.save();

      // Gửi tới main admin nếu online (để nhận realtime message)
      const adminSocket = onlineUsers[adminId];
      if (adminSocket) {
        io.to(adminSocket).emit('receive-message', {
          user_id: data.user_id,
          sender_type: 'user',
          message: data.message,
          timestamp: new Date()
        });
        
        // Also emit event để admin biết có chat mới/message mới
        io.to(adminSocket).emit('chat-updated', {
          user_id: data.user_id,
          admin_id: adminId,
          type: 'new-message',
          lastMessage: data.message,
          timestamp: new Date()
        });
      } else {
        // Nếu admin offline, broadcast tới tất cả admin users để họ reload
        console.log('📢 Broadcasting chat-updated to all online admins');
        io.emit('chat-updated', {
          user_id: data.user_id,
          admin_id: adminId,
          type: 'new-message',
          lastMessage: data.message,
          timestamp: new Date()
        });
      }

      // Phản hồi cho user
      socket.emit('message-sent', { status: 'sent' });

    } catch (err) {
      console.error('Error saving message:', err);
      socket.emit('message-error', { error: err.message });
    }
  });

  // Message từ admin tới user (ALWAYS FROM MAIN ADMIN)
  socket.on('admin-reply', async (data) => {
    // data: { user_id, message }
    // admin_id must be main admin
    const AdminChat = require('./models/adminChatModel');
    const mongoose = require('mongoose');

    try {
      // Validate dữ liệu
      if (!data.user_id || !data.message) {
        console.error('Missing required fields in admin-reply:', { user_id: data.user_id, message: data.message });
        return socket.emit('message-error', { error: 'Thiếu thông tin cần thiết' });
      }

      // Validate user_id
      if (!mongoose.Types.ObjectId.isValid(data.user_id)) {
        console.error('Invalid user_id format:', data.user_id);
        return socket.emit('message-error', { error: 'Invalid user_id' });
      }

      // Force to use main admin
      const adminId = await getMainAdmin();
      if (!adminId) {
        console.error('❌ No main admin found');
        return socket.emit('message-error', { error: 'Admin không khả dụng' });
      }

      console.log('📨 Saving admin reply for user:', data.user_id, 'from main admin:', adminId);

      let chat = await AdminChat.findOne({
        user_id: data.user_id,
        admin_id: adminId
      });

      // Nếu không tồn tại chat, tạo mới
      if (!chat) {
        chat = new AdminChat({
          user_id: data.user_id,
          admin_id: adminId,
          messages: []
        });
      }

      chat.messages.push({
        sender_id: adminId,
        sender_type: 'admin',
        content: data.message,
        timestamp: new Date()
      });

      await chat.save();

      // Gửi tới user nếu online
      const userSocket = onlineUsers[data.user_id];
      if (userSocket) {
        io.to(userSocket).emit('receive-message', {
          admin_id: adminId,
          sender_type: 'admin',
          message: data.message,
          timestamp: new Date()
        });
      }

      socket.emit('message-sent', { status: 'sent' });

    } catch (err) {
      console.error('Error saving admin message:', err);
      socket.emit('message-error', { error: err.message });
    }
  });

  // User disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    delete onlineUsers[Object.keys(onlineUsers).find(key => onlineUsers[key] === socket.id)];
    io.emit('users-online', Object.keys(onlineUsers));
  });
});

//connect mongoose DB
const URI = process.env.MONGODB_URL;

async function connectToDatabase() {
  try {
    await mongoose.connect(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to the database');
    
    // Auto-consolidate chats on startup
    setTimeout(async () => {
      try {
        console.log('\n🔄 Auto-consolidating chats on startup...');
        const AdminChat = require('./models/adminChatModel');
        const User = require('./models/userModel');
        
        // Get all empty chats and delete them
        const emptyChats = await AdminChat.find({ $or: [{ messages: [] }, { messages: null }] });
        if (emptyChats.length > 0) {
          await AdminChat.deleteMany({ $or: [{ messages: [] }, { messages: null }] });
          console.log(`✅ Deleted ${emptyChats.length} empty chats`);
        }
        
        // Get main admin
        const mainAdmin = await User.findOne({ role: 1 });
        if (mainAdmin) {
          // Get all chats and update to use main admin only
          const allChats = await AdminChat.find();
          let updated = 0;
          
          for (const chat of allChats) {
            if (chat.admin_id.toString() !== mainAdmin._id.toString()) {
              chat.admin_id = mainAdmin._id;
              await chat.save();
              updated++;
            }
          }
          
          if (updated > 0) {
            console.log(`✅ Updated ${updated} chats to use main admin`);
          }
        }
        
        console.log('✅ Consolidation complete\n');
      } catch (err) {
        console.error('❌ Error during auto-consolidation:', err.message);
      }
    }, 2000);
    
  } catch (error) {
    console.error('Failed to connect to the database:', error);
  }
}

connectToDatabase();

// Add admin chat routes
app.use('/api', require('./routes/adminChatRouter'))

if(process.env.NODE_ENV === 'production'){
    app.use(express.static('client/build'))
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'))
    })
}

const PORT = process.env.PORT || 5000
server.listen(PORT, ()=>{
    console.log("Server đang chạy trên cổng", PORT)
})