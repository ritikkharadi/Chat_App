const User = require("../model/User");
const Chat = require("../model/Chat");
const FriendRequest=require("../model/Request");
const mongoose = require('mongoose');
const { NEW_REQUEST} = require('../constants/event');
const { emitEvent } = require("../constants/event");

exports.searchUser = async (req, res) => {
    try {
        const { userName = "" } = req.query;

        console.log("Request user ID:", req.user);

        // Find all chats where the user is a member
        const myChats = await Chat.find({ groupChat: false, members: req.user.id });
        console.log("mychats",myChats);
        // Extract all user IDs from these chats
        const allUsersFromMyChat = myChats.flatMap((chat) => chat.members);
        console.log("ALLUSERS_FROM_MY_CHAT:", allUsersFromMyChat);

       

        // Find users who are not in any of the user's chats and match the username query
        const otherUsers = await User.find({
            _id: { $nin: allUsersFromMyChat },
            userName: { $regex: new RegExp(`^${userName}`, "i") }
        }).select("_id userName image firstName lastName ");

        //console.log("OTHER_USERS:", otherUsers);

        const users = otherUsers.map(user => ({
            _id: user._id,
            userName: user.userName,
            image: user.image?.url,
            firstName:user.firstName,
            lastName:user.lastName,
        }));
        console.log("user:", users);
      

        res.status(200).json({
            success: true,
            users,
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

exports.sendFriendRequest = async (req, res) => {
    try {
        const { receiverId } = req.body;
        const senderId = req.user.id; // Assuming req.user.id is the sender's ID
        console.log("receiverId", req.body );
        // Check if sender and receiver are the same
        if (senderId === receiverId) {
            return res.status(400).json({
                success: false,
                message: "You cannot send a friend request to yourself.",
            });
        }

        // Check if receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({
                success: false,
                message: "Receiver user not found.",
            });
        }

        // Check if any friend request already exists between sender and receiver
        const existingRequest = await FriendRequest.findOne({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId }
            ]
        });

        if (existingRequest) {
            return res.status(400).json({
                success: false,
                message: "Friend request already sent or pending.",
            });
        }

        // Create new friend request (sender to receiver)
        const newFriendRequest = new FriendRequest({
            sender: senderId,
            receiver: receiverId,
        });

        emitEvent(req,newFriendRequest,[receiver]);
        // Save the friend request to the database
        await newFriendRequest.save();

        res.status(201).json({
            success: true,
            message: "Friend request sent successfully.",
            friendRequest: newFriendRequest,
        });

    } catch (error) {
        console.error('Error sending friend request:', error);
        res.status(500).json({
            success: false,
            message: "Failed to send friend request. Please try again.",
        });
    }
};


exports.handleFriendRequest = async (req, res) => {
    try {
        const { requestId, action } = req.body;

        // Find the friend request by ID and populate sender and receiver
        const friendRequest = await FriendRequest.findById(requestId).populate('sender').populate('receiver' );
        console.log('f_request',friendRequest);
        // Check if the friend request exists
        if (!friendRequest) {
            return res.status(404).json({
                success: false,
                message: "Friend request not found",
            });
        }
        console.log('f_request_status',friendRequest.status);
        // Check if the friend request is pending
        

        if (action) {
            // Update the friend request status to accepted
            friendRequest.status = "accepted";
            await friendRequest.save();

            // Create a new chat between the sender and receiver
            const chat = new Chat({
              
                groupChat: false,
                Name: `${friendRequest.sender.userName} and ${friendRequest.receiver.userName}`,
                
                members: [friendRequest.sender._id, friendRequest.receiver._id],
            });
            await chat.save();

            res.status(200).json({
                success: true,
                message: "Friend request accepted",
                friendRequest,
                chat,
            });
        } else {
            // Update the friend request status to rejected
            await FriendRequest.findByIdAndDelete(requestId);
            res.status(200).json({
                success: true,
                message: "Friend request rejected",
               
            });
        }
    } catch (error) {
        console.error("Error handling friend request:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

exports.getNotification = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming userId is available in req.user after authentication

        // Find all friend requests for the user
        const friendRequests = await FriendRequest.find({ receiver: userId })
            .populate({
                path: 'sender', // Populate the sender field which references the User model
                select: 'userName image', // Select only userName and image fields
            })
            .exec();

        // Map the results to include necessary fields
        const requests = friendRequests.map(request => ({
            id: request._id,
            sender: {
                id: request.sender._id,
                userName: request.sender.userName,
                image: request.sender.image?.url, // Assuming image is an object with a URL field
            },
            status: request.status,
            createdAt: request.createdAt,
        }));

     

        res.status(200).json({
            success: true,
            requests,
        });
    } catch (error) {
        console.error('Error fetching friend requests:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

exports.getMyFriends = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find all chats where the user is a member
        const myChats = await Chat.find({ members: userId });

        // Extract all unique member IDs from these chats, excluding the user themselves
        const allMembers = new Set();
        myChats.forEach(chat => {
            chat.members.forEach(memberId => {
                if (memberId.toString() !== userId) {
                    allMembers.add(memberId.toString());
                }
            });
        });

        // Convert the Set to an array
        const friendIds = Array.from(allMembers);

        // Fetch user details for all member IDs
        const friends = await User.find({
            _id: { $in: friendIds }
        }).select('_id userName image');

        // Format the friends' data
        const formattedFriends = friends.map(friend => ({
            _id: friend._id,
            userName: friend.userName,
            image: friend.image?.url
        }));

        res.status(200).json({
            success: true,
            friends: formattedFriends
        });
    } catch (error) {
        console.error('Error fetching friends:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};