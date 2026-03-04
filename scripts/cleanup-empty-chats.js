// Script to remove empty chat sessions from MongoDB
// Run this to clean up existing empty documents

const mongoose = require('mongoose');
require('dotenv').config();

const Chat = require('./models/chatModel');

const cleanupEmptyChatSessions = async () => {
    try {
        console.log('🧹 Starting cleanup of empty chat sessions...\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find all empty chat sessions
        const emptySessions = await Chat.find({ 
            'messages': { $size: 0 } 
        });

        console.log(`\n📊 Found ${emptySessions.length} empty chat sessions\n`);

        if (emptySessions.length > 0) {
            console.log('Empty sessions to be deleted:');
            emptySessions.forEach(session => {
                console.log(`  - ${session.session_id} (Created: ${session.createdAt})`);
            });

            // Delete all empty sessions
            const result = await Chat.deleteMany({ 
                'messages': { $size: 0 } 
            });

            console.log(`\n🗑️  Deleted ${result.deletedCount} empty chat sessions\n`);
        } else {
            console.log('✅ No empty chat sessions found\n');
        }

        // Show statistics
        const totalSessions = await Chat.countDocuments();
        const sessionsWithMessages = await Chat.countDocuments({ 
            'messages': { $ne: [] } 
        });

        console.log('📈 Database Statistics:');
        console.log(`  Total chat sessions: ${totalSessions}`);
        console.log(`  Sessions with messages: ${sessionsWithMessages}`);
        console.log(`  Empty sessions: ${totalSessions - sessionsWithMessages}`);

        await mongoose.connection.close();
        console.log('\n✅ Cleanup completed and disconnected from MongoDB');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error during cleanup:', err);
        process.exit(1);
    }
};

// Run cleanup
cleanupEmptyChatSessions();
