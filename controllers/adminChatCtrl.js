const AdminChat = require("../models/adminChatModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const { ADMIN_IDS, getMainAdmin } = require("../config/adminConfig");

const adminChatCtrl = {
  // Lấy danh sách admin
  getAdminList: async (req, res) => {
    try {
      // Lấy tất cả user có role admin
      const admins = await User.find({ role: 1 }).select("_id name email avatar");
      
      res.json({
        status: "success",
        admins: admins || []
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  // Lấy tất cả user chats (từ Chat collection - chat với AI)
  getAllUserChats: async (req, res) => {
    try {
      console.log('📋 Getting all user chats (AI chat)...');
      
      // Lấy tất cả chats từ Chat collection (những chats user với AI)
      const chats = await Chat.find()
        .sort({ updatedAt: -1 })
        .lean();
      
      console.log('✅ Found', chats.length, 'user chats');

      // Manually populate user data
      const enrichedChats = await Promise.all(
        chats.map(async (chat) => {
          try {
            // Get user data
            if (chat.user_id) {
              const userData = await User.findById(chat.user_id)
                .select('_id name email avatar')
                .lean();
              if (userData) {
                chat.user_id = userData;
              }
            }
          } catch (err) {
            console.error('❌ Error enriching chat:', err.message);
          }
          return chat;
        })
      );

      res.json({
        status: "success",
        chats: enrichedChats || []
      });
    } catch (err) {
      console.error('❌ Error in getAllUserChats:', err.message);
      return res.status(500).json({ msg: err.message });
    }
  },

  // Lấy tất cả chats (dành cho admin xem)
  getAllChats: async (req, res) => {
    try {
      console.log('📋 Getting all chats...');
      
      // Get raw chats first - WITHOUT filter, lọc sau
      const allChats = await AdminChat.find()
        .sort({ updatedAt: -1 })
        .lean();
      
      console.log('✅ Found', allChats.length, 'total chats');

      // Lọc chỉ chats có messages
      const chatsWithMessages = allChats.filter(chat => 
        chat.messages && Array.isArray(chat.messages) && chat.messages.length > 0
      );
      
      console.log('📨 Chats with messages:', chatsWithMessages.length);

      // Manually populate user data
      const User = require("../models/userModel");
      const enrichedChats = await Promise.all(
        chatsWithMessages.map(async (chat) => {
          try {
            // Get user data
            if (chat.user_id) {
              const userData = await User.findById(chat.user_id).select('_id name email avatar').lean();
              if (userData) {
                chat.user_id = userData;
              }
            }
            
            // Get admin data
            if (chat.admin_id) {
              const adminData = await User.findById(chat.admin_id).select('_id name email').lean();
              if (adminData) {
                chat.admin_id = adminData;
              }
            }
          } catch (err) {
            console.error('❌ Error enriching chat:', err.message);
          }
          return chat;
        })
      );

      console.log('✅ Returning', enrichedChats.length, 'enriched chats');

      res.json({
        status: "success",
        chats: enrichedChats || []
      });
    } catch (err) {
      console.error('❌ Error in getAllChats:', err.message);
      console.error('Stack:', err.stack);
      return res.status(500).json({ msg: err.message });
    }
  },

  // Lấy danh sách chat giữa user và admin
  getChatList: async (req, res) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ msg: "Thiếu userId" });
      }

      const chats = await AdminChat.find({ user_id: userId })
        .populate("admin_id", "_id name email avatar")
        .sort({ updatedAt: -1 });

      res.json({
        status: "success",
        chats: chats || []
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  // Lấy lịch sử chat (ALWAYS USE MAIN ADMIN)
  getChatHistory: async (req, res) => {
    try {
      const { userId } = req.params;
      const mongoose = require('mongoose');

      if (!userId) {
        return res.status(400).json({ msg: "Thiếu userId" });
      }

      // Validate userId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.error('❌ Invalid userId format:', userId);
        return res.status(400).json({ msg: "Invalid userId format" });
      }

      // Get main admin từ config array
      const mainAdminId = getMainAdmin();
      
      if (!mainAdminId) {
        console.error('❌ No main admin configured');
        return res.status(400).json({ msg: "No main admin configured in system" });
      }

      console.log('📨 Getting chat history for user:', userId, 'with main admin:', mainAdminId);
      console.log('🔍 Query: user_id =', userId, ', admin_id =', mainAdminId);

      let chat = null;
      
      try {
        const userIdObj = new mongoose.Types.ObjectId(userId);
        const adminIdObj = new mongoose.Types.ObjectId(mainAdminId);
        
        console.log('🔎 Searching with ObjectIds:', {
          user_id: userIdObj.toString(),
          admin_id: adminIdObj.toString()
        });

        // Tìm ALL chats trước (DEBUG)
        const allChats = await AdminChat.find().lean();
        console.log('📊 Total chats in DB:', allChats.length);
        console.log('📋 All chats:', allChats.map(c => ({
          _id: c._id.toString(),
          user_id: c.user_id.toString(),
          admin_id: c.admin_id.toString(),
          messageCount: c.messages?.length || 0
        })));

        // Lấy chat cụ thể
        chat = await AdminChat.findOne({
          user_id: userIdObj,
          admin_id: adminIdObj
        }).lean();
        
        console.log('✅ Query result:', chat ? 'Found' : 'Not found');
        
        if (chat) {
          console.log('📊 Chat details:', {
            _id: chat._id.toString(),
            user_id: chat.user_id.toString(),
            admin_id: chat.admin_id.toString(),
            messageCount: chat.messages?.length || 0,
            firstMessage: chat.messages?.[0]?.content?.substring(0, 30)
          });
        }
        
        // Manually populate user data
        if (chat && chat.user_id) {
          const userData = await User.findById(chat.user_id).select('_id name email').lean();
          if (userData) {
            chat.user_id = userData;
          }
        }
        
        if (chat && chat.admin_id) {
          const adminData = await User.findById(chat.admin_id).select('_id name email').lean();
          if (adminData) {
            chat.admin_id = adminData;
          }
        }
      } catch (err) {
        console.error('❌ Error finding chat:', err.message);
        console.error('Stack:', err.stack);
        return res.status(500).json({ msg: "Error loading chat: " + err.message });
      }

      if (!chat) {
        // KHÔNG tạo chat mới - chỉ trả về empty messages
        // Chat sẽ được tạo khi admin gửi message đầu tiên
        console.log('ℹ️  No chat found for user:', userId, '- returning empty chat');
        
        return res.json({
          status: "success",
          chat: {
            _id: null,
            user_id: userId,
            admin_id: mainAdminId,
            messages: [],
            status: 'active',
            createdAt: new Date()
          }
        });
      }

      res.json({
        status: "success",
        chat: chat
      });
    } catch (err) {
      console.error('❌ Error in getChatHistory:', err);
      return res.status(500).json({ msg: err.message });
    }
  },

  // Tìm hoặc tạo chat room giữa user và admin
  createOrGetChat: async (req, res) => {
    try {
      const { user_id, admin_id } = req.body;

      if (!user_id || !admin_id) {
        return res.status(400).json({ msg: "Thiếu user_id hoặc admin_id" });
      }

      let chat = await AdminChat.findOne({
        user_id: user_id,
        admin_id: admin_id
      });

      if (!chat) {
        chat = new AdminChat({
          user_id: user_id,
          admin_id: admin_id,
          messages: [],
          status: 'active'
        });
        await chat.save();
      }

      res.json({
        status: "success",
        chat: chat
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  // Đóng chat
  closeChat: async (req, res) => {
    try {
      const { chatId } = req.params;

      if (!chatId) {
        return res.status(400).json({ msg: "Thiếu chatId" });
      }

      await AdminChat.findByIdAndUpdate(chatId, { status: 'closed' });

      res.json({
        status: "success",
        msg: "Đã đóng cuộc trò chuyện"
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  // Xóa tất cả chats không có messages
  cleanupEmptyChats: async (req, res) => {
    try {
      console.log('🗑️  Cleaning up empty chats...');
      
      const result = await AdminChat.deleteMany({ messages: [] });
      
      console.log(`✅ Deleted ${result.deletedCount} empty chats`);
      
      res.json({
        status: "success",
        msg: `Xóa ${result.deletedCount} cuộc trò chuyện trống`,
        deletedCount: result.deletedCount
      });
    } catch (err) {
      console.error('❌ Error cleaning empty chats:', err);
      return res.status(500).json({ msg: err.message });
    }
  },

  // Consolidate all chats to use main admin only
  consolidateChats: async (req, res) => {
    try {
      console.log('🔄 Starting consolidation process...');

      // Get main admin từ config array
      const mainAdminId = getMainAdmin();
      if (!mainAdminId) {
        console.error('❌ No main admin configured');
        return res.status(400).json({ msg: 'Không có admin chính được cấu hình' });
      }
      
      // Lấy thông tin admin từ DB
      const mainAdmin = await User.findById(mainAdminId);
      if (!mainAdmin) {
        console.error('❌ Main admin not found in DB');
        return res.status(400).json({ msg: 'Admin chính không tồn tại trong hệ thống' });
      }
      
      console.log('✅ Found main admin:', mainAdmin._id, mainAdmin.name);

      // Get all unique users who have chats
      const chats = await AdminChat.find().lean();
      console.log(`\n📊 Total chat documents: ${chats.length}`);

      // Group by user_id
      const userChatMap = {};
      for (const chat of chats) {
        const userId = chat.user_id.toString();
        if (!userChatMap[userId]) {
          userChatMap[userId] = [];
        }
        userChatMap[userId].push(chat);
      }

      console.log(`\n👥 Unique users: ${Object.keys(userChatMap).length}`);

      // Process each user
      let consolidatedCount = 0;
      let deletedCount = 0;
      let deletedEmptyCount = 0;

      // First pass: delete all empty chats
      for (const chat of chats) {
        if (!chat.messages || chat.messages.length === 0) {
          await AdminChat.deleteOne({ _id: chat._id });
          deletedEmptyCount++;
          console.log(`🗑️  Deleted empty chat for user: ${chat.user_id}`);
        }
      }

      // Reload chats after deleting empty ones
      const remainingChats = await AdminChat.find().lean();

      // Rebuild userChatMap with remaining chats
      const updatedUserChatMap = {};
      for (const chat of remainingChats) {
        const userId = chat.user_id.toString();
        if (!updatedUserChatMap[userId]) {
          updatedUserChatMap[userId] = [];
        }
        updatedUserChatMap[userId].push(chat);
      }

      // Second pass: consolidate by user
      for (const [userId, userChats] of Object.entries(updatedUserChatMap)) {
        if (userChats.length === 1) {
          // Only one chat, check if admin_id is main admin
          const chat = userChats[0];
          if (chat.admin_id.toString() === mainAdmin._id.toString()) {
            console.log(`✅ User ${userId}: Already consolidated`);
            continue;
          } else {
            // Different admin, need to update
            console.log(`⚠️  User ${userId}: Updating to main admin...`);
            await AdminChat.updateOne(
              { _id: chat._id },
              { $set: { admin_id: mainAdmin._id } }
            );
            consolidatedCount++;
          }
        } else {
          // Multiple chats, consolidate to main admin
          console.log(`\n🔄 User ${userId}: Multiple chats (${userChats.length} documents)`);

          // Collect all messages from all chats
          const allMessages = [];
          for (const chat of userChats) {
            if (chat.messages && chat.messages.length > 0) {
              allMessages.push(...chat.messages);
            }
          }

          // Sort messages by timestamp
          allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

          // Find or create consolidated chat with main admin
          let consolidatedChat = await AdminChat.findOne({
            user_id: userId,
            admin_id: mainAdmin._id
          });

          if (!consolidatedChat) {
            consolidatedChat = new AdminChat({
              user_id: userId,
              admin_id: mainAdmin._id,
              messages: allMessages,
              status: 'active',
              createdAt: new Date(),
              updatedAt: new Date()
            });
            console.log(`   ✨ Created new consolidated chat`);
          } else {
            // Merge messages
            consolidatedChat.messages = allMessages;
            console.log(`   ✨ Updated existing consolidated chat`);
          }

          await consolidatedChat.save();
          console.log(`   ✅ Consolidated: ${allMessages.length} messages`);

          // Delete other chat documents for this user
          for (const chat of userChats) {
            if (chat.admin_id.toString() !== mainAdmin._id.toString()) {
              await AdminChat.deleteOne({ _id: chat._id });
              deletedCount++;
              console.log(`   🗑️  Deleted old chat`);
            }
          }

          consolidatedCount++;
        }
      }

      console.log(`\n📈 SUMMARY:`);
      console.log(`   Deleted empty chats: ${deletedEmptyCount}`);
      console.log(`   Consolidated chats: ${consolidatedCount}`);
      console.log(`   Deleted duplicate chats: ${deletedCount}`);

      res.json({
        status: "success",
        msg: "Consolidation complete",
        deletedEmptyCount,
        consolidatedCount,
        deletedCount
      });

    } catch (error) {
      console.error('❌ Error during consolidation:', error);
      return res.status(500).json({ msg: error.message });
    }
  }
};

module.exports = adminChatCtrl;
