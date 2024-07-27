const express =require("express");
const app = express();

const { seedUsers } = require('./utils/seeder/userSeed');
const{generateTestChats}=require('./utils/seeder/chatSeed');
const{generateTestGroupChats}=require('./utils/seeder/chatSeed');
const{generateMessages,createMessagesInChat}=require('./utils/seeder/chatSeed');
const userRoutes = require("./routes/User");
 const chatRoutes = require("./routes/Chat");
const profileRoutes=require("./routes/Profile");
const AdminRoutes=require("./routes/Admin")
const { createServer } = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const database = require("./config/database");
const {cloudinaryConnect}=require("./config/cloudinary")
const cookieParser = require("cookie-parser")
const cors = require("cors"); //to connect with frontend cors=core origin resource sharing
// const {cloudinaryConnect } = require("./config/cloudinary");
// const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
const { NEW_MESSAGE, NEW_MESSAGE_ALERT } = require("./constants/event");
const User = require('../server/model/User');
const Chat = require('../server/model/Chat');
const Message = require('../server/model/Message');
const http = require("http");
const jwt=require("jsonwebtoken");
// app.use((req, res, next) => {
// 	res.header('Access-Control-Allow-Origin', '*');
// 	next();
// });
// app.use(
// 	fileUpload({
// 		useTempFiles: true,
// 		tempFileDir: "/tmp",
// 	})
// );
//cloudinary connection
const {userSocketIds}=require("./utils/socket")
dotenv.config();
const PORT = process.env.PORT || 4000;

database.connect();

seedUsers(0);
generateTestChats(0);
generateTestGroupChats(0);
generateMessages(0);
createMessagesInChat("666f3df7f34329a248a4e8cd", 0);

app.use(express.json());
app.use(cookieParser());
app.use(cors({ 
    origin: "http://localhost:3000",
    methods:["GET","PUT","POST","DELETE"], 
    credentials: true 
}));

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/admin", AdminRoutes);
app.use("/api/v1/profile", profileRoutes);
app.get("/", (req, res) => {
    res.json({ success: true, message: 'Your server is up and running....' });
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: { 
        origin: "http://localhost:3000", 
        credentials: true 
    }
});



const users = {};

io.on('connection', (socket) => {
  //  console.log('A user connected', socket.id);

    // Register a user
    socket.on('REGISTER_USER', (userId) => {
      //  console.log(`Registering user ${userId} with socket ID ${socket.id}`);

        userSocketIds.set(userId, socket.id);
        users[userId] = socket.id;
        console.log("users",users);

        // Emit USER_ONLINE event
        io.emit('USER_ONLINE', { userId });
        io.emit('ONLINE_USERS', Object.keys(users)); // Broadcast online users
    });

    // Handle user going offline
    socket.on('USER_OFFLINE', (userId) => {
        if (users[userId]) {
            console.log(`User ${userId} went offline`);
            delete users[userId];
            userSocketIds.delete(userId);

            io.emit('USER_OFFLINE', { userId });
            io.emit('ONLINE_USERS', Object.keys(users)); // Broadcast online users
        }
    });

    // Handle sending a friend request
    socket.on('SEND_FRIEND_REQUEST', async ({ receiverId, token }) => {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const senderId = decoded.id;

            if (senderId === receiverId) {
                socket.emit('ERROR', { message: 'You cannot send a friend request to yourself.' });
                return;
            }

            const receiver = await User.findById(receiverId);
            if (!receiver) {
                socket.emit('ERROR', { message: 'Receiver user not found.' });
                return;
            }

            const existingRequest = await FriendRequest.findOne({
                $or: [
                    { sender: senderId, receiver: receiverId },
                    { sender: receiverId, receiver: senderId },
                ],
            });

            if (existingRequest) {
                socket.emit('ERROR', { message: 'Friend request already sent or pending.' });
                return;
            }

            const newFriendRequest = new FriendRequest({
                sender: senderId,
                receiver: receiverId,
            });

            await newFriendRequest.save();

            const receiverSocketId = userSocketIds.get(receiverId.toString());
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('RECEIVE_FRIEND_REQUEST', newFriendRequest);
            }

            socket.emit('FRIEND_REQUEST_SENT', newFriendRequest);
        } catch (error) {
            console.error('Error sending friend request:', error);
            socket.emit('ERROR', { message: 'Failed to send friend request. Please try again.' });
        }
    });

    // Handle sending a new message
    socket.on('NEW_MESSAGE', async ({ chatId, content, token }, callback) => {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const senderId = decoded.id;
    
            const chat = await Chat.findById(chatId).populate('members', 'userName image');
            if (!chat) {
                callback({ success: false, message: 'Chat not found' });
                return;
            }
    
            const sender = await User.findById(senderId).select('userName');
            if (!sender) {
                callback({ success: false, message: 'Sender not found' });
                return;
            }
    
            const messageForRealTime = {
                content,
                _id: uuidv4(),
                sender: {
                    _id: senderId,
                    userName: sender.userName,
                },
                chat: chatId,
                createdAt: new Date().toISOString(),
            };
    
            const messageForDB = {
                content,
                sender: senderId,
                chat: chatId,
                createdAt: new Date(),
            };
    
            const dbMessage = new Message(messageForDB);
            await dbMessage.save();
    
            chat.members.forEach((member) => {
                const memberSocketId = userSocketIds.get(member._id.toString());
                if (memberSocketId) {
                    io.to(memberSocketId).emit('RECEIVE_MESSAGE', messageForRealTime);
                }
            });
    
            callback({ success: true, messageForRealTime });
        } catch (error) {
            console.error('Error handling NEW_MESSAGE event:', error);
            callback({ success: false, message: 'Failed to send message' });
        }
    });

    // Handle start typing
    socket.on('START_TYPING', (data) => {
        socket.broadcast.to(data.chatId).emit('USER_TYPING', { userId: data.userId, chatId: data.chatId });
    });

    // Handle stop typing
    socket.on('STOP_TYPING', (data) => {
        socket.broadcast.to(data.chatId).emit('USER_STOP_TYPING', { userId: data.userId, chatId: data.chatId });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected', socket.id);
        const userId = Object.keys(users).find((key) => users[key] === socket.id);
        if (userId) {
            console.log(`User ${userId} removed from online list`);
            delete users[userId];
            userSocketIds.delete(userId);
            io.emit('USER_OFFLINE', { userId });
            io.emit('ONLINE_USERS', Object.keys(users)); // Broadcast updated online users
        }
    });
});

server.listen(PORT, () => {
    console.log(`App is running at ${PORT}`);
});