/**
 * CONSOLIDATE CHATS SCRIPT
 * Merger tất cả chat documents của một user thành một document với main admin
 * 
 * Usage: node scripts/consolidate-chats.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const AdminChat = require('../models/adminChatModel');
const User = require('../models/userModel');

const consolidateChats = async () => {
  try {
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/shop-app');

    // Get main admin (role: 1)
    const mainAdmin = await User.findOne({ role: 1 });
    if (!mainAdmin) {
      console.error('❌ No main admin found');
      process.exit(1);
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

    for (const [userId, userChats] of Object.entries(userChatMap)) {
      if (userChats.length === 1) {
        // Only one chat, check if admin_id is main admin
        const chat = userChats[0];
        if (chat.admin_id.toString() === mainAdmin._id.toString()) {
          console.log(`✅ User ${userId}: Already consolidated (1 chat with main admin)`);
          continue;
        } else {
          // Different admin, need to update
          console.log(`⚠️  User ${userId}: Single chat but with different admin, updating...`);
          await AdminChat.updateOne(
            { _id: chat._id },
            { $set: { admin_id: mainAdmin._id } }
          );
          consolidatedCount++;
          console.log(`   Updated to main admin`);
        }
      } else {
        // Multiple chats, consolidate to main admin
        console.log(`\n🔄 User ${userId}: Multiple chats (${userChats.length} documents)`);

        // Collect all messages from all chats
        const allMessages = [];
        for (const chat of userChats) {
          console.log(`   - Chat ${chat._id} with admin ${chat.admin_id}`);
          console.log(`     Messages: ${chat.messages?.length || 0}`);
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
            console.log(`   🗑️  Deleted old chat: ${chat._id}`);
          }
        }

        consolidatedCount++;
      }
    }

    console.log(`\n📈 SUMMARY:`);
    console.log(`   Consolidated chats: ${consolidatedCount}`);
    console.log(`   Deleted old chats: ${deletedCount}`);
    console.log(`\n✅ Consolidation complete!`);

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error during consolidation:', error);
    process.exit(1);
  }
};

consolidateChats();
