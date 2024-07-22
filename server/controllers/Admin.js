const User = require('../model/User');
const Chat = require('../model/Chat');
const Message = require('../model/Message');
const bcrypt=require("bcrypt");
const Admin = require('../model/Admin');
const jwt=require("jsonwebtoken");

exports.createAdmin = async (req, res) => {
    try {
        const { email, password,name } = req.body;

     
        // Validate email and password
        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                message: 'Please fill all the details carefully',
            });
        }

        // Check if the admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Admin with this email already exists',
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new admin
        const newAdmin = new Admin({
            email,
            password: hashedPassword,
            name,
        });

        // Save the admin to the database
        await newAdmin.save();

        res.status(201).json({
            success: true,
            message: 'Admin created successfully',
        });
    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

exports.adminLogin = async (req, res) => {
    try {
        const { secretKey, email, password } = req.body;

        // Check if secret key matches
        if (secretKey !== process.env.ADMIN_SECRET_KEY) {
            return res.status(403).json({
                success: false,
                message: 'Invalid secret key',
            });
        }

        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please fill all the details carefully',
            });
        }

        // Find the admin by email
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Admin not found',
            });
        }

        // Verify password
        const isPasswordMatch = await bcrypt.compare(password, admin.password);
        if (!isPasswordMatch) {
            return res.status(403).json({
                success: false,
                message: 'Password incorrect',
            });
        }

        // Generate JWT token
        const payload = {
            email: admin.email,
            id: admin._id,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "6h",
        });

        // Return the token and admin data
        res.status(200).json({
            success: true,
            token,
            admin: {
                id: admin._id,
                email: admin.email,
            },
            message: 'Admin logged in successfully',
        });
    } catch (error) {
        console.error('Error during admin login:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.getAllUsers = async (req, res) => {
    try {
        // Step 1: Fetch all users
        const users = await User.find().select('_id firstName lastName userName image');

        // Step 2: Fetch all chats to identify groups and friends
        const allChats = await Chat.find();

        // Step 3: Prepare user information
        const userDetails = users.map(user => {
            const userId = user._id.toString();
            
            // Find groups the user is part of and count them
            const groupCount = allChats.filter(chat => chat.groupChat && chat.members.includes(userId)).length;

            // Find friends (members in non-group chats) and count unique friends
            const friends = new Set();
            allChats
                .filter(chat => !chat.groupChat && chat.members.includes(userId))
                .forEach(chat => {
                    chat.members.forEach(memberId => {
                        if (memberId.toString() !== userId) {
                            friends.add(memberId.toString());
                        }
                    });
                });

            return {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                userName: user.userName,
                image: user.image?.url,
                groupCount,
                friendCount: friends.size
            };
        });

        res.status(200).json({
            success: true,
            users: userDetails
        });
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};




exports.getAllChats = async (req, res) => {
    try {
        // Fetch all chats
        const chats = await Chat.find()
            .populate('members', '_id userName image')
            .populate('creator', '_id userName');

        console.log('Fetched Chats:', chats);

        // Prepare detailed chat information
        const chatDetails = await Promise.all(chats.map(async chat => {
            console.log('Processing Chat:', chat);

            // Ensure members are populated
            const members = chat.members ? chat.members.map(member => {
                console.log('Processing Member:', member);
                return {
                    _id: member._id,
                    userName: member.userName,
                    image: member.image?.url,
                };
            }) : [];

            // Fetch total number of messages in the chat
            const totalMessages = await Message.countDocuments({ chat: chat._id });

            // Ensure creator is populated
            const creator = chat.creator ? {
                _id: chat.creator._id,
                userName: chat.creator.userName,
            } : null;

            console.log('Processed Chat Details:', {
                _id: chat._id,
                name: chat.Name,
                members,
                numberOfMembers: members.length,
                totalMessages,
                creator,
            });

            return {
                _id: chat._id,
                name: chat.Name,
                members,
                numberOfMembers: members.length,
                totalMessages,
                creator,
            };
        }));

        res.status(200).json({
            success: true,
            chats: chatDetails,
        });
    } catch (error) {
        console.error('Error fetching all chats:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

exports.getAllMessages = async (req, res) => {
    try {
        // Fetch all messages
        const messages = await Message.find()
            .populate('chat', '_id Name groupChat')
            .populate('sender', '_id userName');

        // Prepare detailed message information
        const messageDetails = messages.map(message => {
            const chatName = message.chat ? message.chat.Name : null;
            const isGroupChat = message.chat ? message.chat.groupChat : false;
            const sender = message.sender ? {
                _id: message.sender._id,
                userName: message.sender.userName,
                image: message.sender.image?.url,
            } : null;

            return {
                _id: message._id,
                content: message.content,
                attachment: message.attachment,
                chatName,
                sentBy: sender,
                isGroup: isGroupChat,
                time: message.createdAt,
            };
        });

        res.status(200).json({
            success: true,
            messages: messageDetails,
        });
    } catch (error) {
        console.error('Error fetching all messages:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.dashboard = async (req, res) => {
    try {
        const [groupChats, userCount, chatCount, messageCount] = await Promise.all([
            Chat.countDocuments({ groupChat: true }),
            User.countDocuments(),
            Chat.countDocuments(),
            Message.countDocuments()
        ]);

        const today = new Date();
        const last7days = new Date();
        last7days.setDate(last7days.getDate() - 7);

        const last7daysMessages = await Message.find({
            createdAt: {
                $gte: last7days,
                $lte: today,
            },
        }).select("createdAt");

        const messages = new Array(7).fill(0);

        last7daysMessages.forEach((message) => {
            const index = Math.floor((today.getTime() - message.createdAt.getTime()) / (1000 * 60 * 60 * 24));
            messages[index] += 1;
        });

        const [newUsers, newMessages, newChats] = await Promise.all([
            User.countDocuments({ createdAt: { $gte: last7days } }),
            Message.countDocuments({ createdAt: { $gte: last7days } }),
            Chat.countDocuments({ createdAt: { $gte: last7days } })
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalUsers: userCount,
                totalGroupChats: groupChats,
                totalChats: chatCount,
                totalMessages: messageCount,
                newUsersInLast7Days: newUsers,
                newMessagesInLast7Days: newMessages,
                newChatsInLast7Days: newChats,
                messagesLast7Days: messages.reverse()  // Reverse to get the order from 7 days ago to today
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};