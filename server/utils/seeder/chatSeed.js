const mongoose = require('mongoose');
const faker = require('@faker-js/faker').faker;
const User = require('../../model/User');
const Chat=require("../../model/Chat");
const Message=require("../../model/Message");


const generateTestChats = async (numChats) => {
    try {
        // Fetch all users from the database
        const users = await User.find({});

        if (users.length < 2) {
            console.error("Not enough users to create chats. At least 2 users are required.");
            return null;
        }

        // Function to get random user except the given one
        const getRandomUserExcept = (excludeUserId) => {
            const filteredUsers = users.filter(user => user._id.toString() !== excludeUserId.toString());
            const randomIndex = Math.floor(Math.random() * filteredUsers.length);
            return filteredUsers[randomIndex];
        };

        // Generate the specified number of chats
        for (let i = 0; i < numChats; i++) {
            // Select two random users for the chat
            const user1 = users[Math.floor(Math.random() * users.length)];
            const user2 = getRandomUserExcept(user1._id);

            // Create a new chat
            const chat = new Chat({
                Name: `Test Chat ${i + 1}`,
                userName: user1._id, // Assigning the first user as the creator
                groupChat: false,
                creator: user1._id,
                members: [user1._id, user2._id],
            });

            await chat.save();

            // Create a number of sample messages for the chat
            const numMessages = Math.floor(Math.random() * 10) + 1; // Random number of messages between 1 and 10
            for (let j = 0; j < numMessages; j++) {
                const sender = Math.random() < 0.5 ? user1._id : user2._id; // Randomly choose the sender
                const message = new Message({
                    sender,
                    chat: chat._id,
                    content: faker.lorem.sentence(),
                    attachment: {
                        public_id: faker.datatype.uuid(),
                        url: faker.image.imageUrl(),
                    }
                });

                await message.save();
            }

            console.log(`Chat ${i + 1} created successfully with ID: ${chat._id}`);
        }

        console.log("All test chats created successfully.");
    } catch (error) {
        console.error("Error in seeder function:", error);
    }
};

const generateTestGroupChats = async (numGroupChats) => {
    try {
        // Fetch all users from the database
        const users = await User.find({});

        if (users.length < 3) {
            console.error("Not enough users to create group chats. At least 3 users are required.");
            return null;
        }

        // Function to get random users excluding the given ones
        const getRandomUsersExcept = (excludeUserIds, numUsers) => {
            const filteredUsers = users.filter(user => !excludeUserIds.includes(user._id.toString()));
            const randomUsers = [];
            while (randomUsers.length < numUsers && filteredUsers.length > 0) {
                const randomIndex = Math.floor(Math.random() * filteredUsers.length);
                randomUsers.push(filteredUsers.splice(randomIndex, 1)[0]);
            }
            return randomUsers;
        };

        // Generate the specified number of group chats
        for (let i = 0; i < numGroupChats; i++) {
            // Select at least three random users for the group chat
            const creator = users[Math.floor(Math.random() * users.length)];
            const numMembers = Math.floor(Math.random() * (users.length - 2)) + 2; // Random number of members between 2 and users.length - 1
            const members = getRandomUsersExcept([creator._id.toString()], numMembers);

            // Create a new group chat
            const groupChat = new Chat({
                Name: `Test Group Chat ${i + 1}`,
                userName: creator._id, // Assigning the creator
                groupChat: true,
                creator: creator._id,
                members: [creator._id, ...members.map(user => user._id)],
            });

            await groupChat.save();

            // Create a number of sample messages for the group chat
            const numMessages = Math.floor(Math.random() * 10) + 1; // Random number of messages between 1 and 10
            for (let j = 0; j < numMessages; j++) {
                const sender = [creator, ...members][Math.floor(Math.random() * (numMembers + 1))]._id; // Randomly choose the sender from the members
                const message = new Message({
                    sender,
                    chat: groupChat._id,
                    content: faker.lorem.sentence(),
                    attachment: {
                        public_id: faker.datatype.uuid(),
                        url: faker.image.imageUrl(),
                    }
                });

                await message.save();
            }

            console.log(`Group Chat ${i + 1} created successfully with ID: ${groupChat._id}`);
        }

        console.log("All test group chats created successfully.");
    } catch (error) {
        console.error("Error in seeder function:", error);
    }
};
const generateMessages = async (numMessages) => {
    try {
        // Fetch all users and chats from the database
        const users = await User.find({});
        const chats = await Chat.find({});

        if (users.length === 0 || chats.length === 0) {
            console.log('No users or chats found in the database.');
            return;
        }

        // Create messages
        for (let i = 0; i < numMessages; i++) {
            // Select random user and chat
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const randomChat = chats[Math.floor(Math.random() * chats.length)];

            const message = new Message({
                sender: randomUser._id,
                chat: randomChat._id,
                content: faker.lorem.sentence(),
                attachment: {
                    public_id: faker.datatype.uuid(),
                    url: faker.image.imageUrl(),
                },
            });

            await message.save();
        }

        console.log(`Successfully created ${numMessages} messages.`);
    } catch (error) {
        console.error('Error generating messages:', error);
    }
};
const createMessagesInChat = async (chatId, numMessages) => {
    try {
        // Find the chat by its ID
        const chat = await Chat.findById(chatId);
        if (!chat) {
            console.log(`Chat with ID ${chatId} not found.`);
            return;
        }

        // Fetch all users from the database
        const users = await User.find({});
        if (users.length === 0) {
            console.log('No users found in the database.');
            return;
        }

        // Create messages
        for (let i = 0; i < numMessages; i++) {
            // Select random user
            const randomUser = users[Math.floor(Math.random() * users.length)];

            const message = new Message({
                sender: randomUser._id,
                chat: chatId,
                content: faker.lorem.sentence(),
                attachment: {
                    public_id: faker.datatype.uuid(),
                    url: faker.image.imageUrl(),
                },
            });

            await message.save();
        }

        console.log(`Successfully created ${numMessages} messages in chat ${chatId}.`);
    } catch (error) {
        console.error(`Error generating messages for chat ${chatId}:`, error);
    }
};

module.exports = { generateTestChats,generateTestGroupChats,generateMessages,createMessagesInChat };