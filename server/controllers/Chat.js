const mongoose = require('mongoose');
const Chat = require('../model/Chat');
const { emitEvent } = require('../utils/features/emitEvent');
const { ALERT, REFETCH_CHATS, NEW_MESSAGE, NEW_MESSAGE_ALERT } = require('../constants/event');
const User = require('../model/User');
const Message =require('../model/Message');
const { deleteFilesFromCloudinary } = require('../utils/deleteAttachmentsFromCloudinary');
const{uploadFilesToCloudinary}=require('../utils/ImageUploder');
exports.groupChat = async (req, res) => {
    try {
        console.log('Request Body:', req.body); // Debugging line
        console.log('Request User:', req.user); // Debugging line

        const { Name, members } = req.body;

        if (!Array.isArray(members) || members.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Minimum 3 members required to form a group',
            });
        }
        console.log("req.user._id",req.user.id);

        if (!req.user ) {
            return res.status(400).json({
                success: false,
                message: 'User information is missing',
            });
        }

        // Convert members to ObjectId array
        const memberIds = members.map(member => new mongoose.Types.ObjectId(member));
        
        // Include creator in the members array
        memberIds.push(new mongoose.Types.ObjectId(req.user.id));

        const chat = new Chat({
            Name,
            userName: new mongoose.Types.ObjectId(req.user.id),
            groupChat: true,
            creator: new mongoose.Types.ObjectId(req.user.id),
            members: memberIds,
        });

        await chat.save();

        emitEvent(req, ALERT, memberIds, `Welcome to ${Name} group`);
        emitEvent(req, REFETCH_CHATS, members);

        res.status(201).json({
            success: true,
            message: 'Group chat created successfully',
            chat: chat // Optional: Send back the created chat object if needed
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
// Controller function to get user's chats


exports.getMyChats = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming req.user has an _id field representing ObjectId
        console.log("user",userId);
        // Find chats where the user is either the creator or a member
        const chats = await Chat.find({ members: userId })
            .populate('members', 'Name image userName');
        console.log("chat",chats);
        if (!chats) {
            return res.status(404).json({
                success: true,
                message: 'No chats found for the user',
                chats: []
            });
        }

        const updatedChats = chats.map(({ _id, Name, members, groupChat }) => {
            // Mapping logic to customize output if needed
            const otherMembers = members.filter(member => member._id.toString() !== userId.toString());
            console.log("otherMembers",otherMembers);
            
            return {
                _id,
                groupChat,
                Name,
                avatar: groupChat ? members.slice(0, 3).map(member => member.image.url) : otherMembers.length > 0 ? [otherMembers[0].image.url] : [],
                name: groupChat ? Name :  otherMembers[0].userName ,
                members: otherMembers, // Assuming you want to return IDs of all members
            };
        });
        console.log('updatedchats',updatedChats);

        return res.status(200).json({
            success: true,
            chats: updatedChats,
        });
    } catch (err) {
        console.error('Error fetching chats:', err);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch chats',
        });
    }
};



exports.getMyGroups = async (req, res) => {
    try {
        const user = req.user; // Assuming req.user is set by an authentication middleware

        // Find group chats where the user is a member and also the creator
        const groups = await Chat.find({ members: user.id, groupChat: true, creator: user.id })
            .populate('members', 'userName image');

        const updatedGroups = groups.map(({ _id, Name, groupChat, members }) => {
            return {
                _id,
                groupChat,
                Name,
                image: members.slice(0, 3).map(({ image }) => image.url), // Assuming members have image field
            };
        });

        return res.status(200).json({
            success: true,
            groups: updatedGroups,
        });
    } catch (err) {
        console.error('Error fetching groups:', err);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch groups',
        });
    }
};

exports.addMembers = async (req, res) => {
    try {
        console.log('Request Body:', req.body); // Debugging line
        console.log('Request User:', req.user); // Debugging line

        const { ChatId, members } = req.body;

        if (!Array.isArray(members) || members.length < 1) {
            return res.status(400).json({
                success: false,
                message: 'At least 1 member is required to add to the group',
            });
        }
        
        console.log("req.user.id", req.user.id);

        const chat = await Chat.findById(ChatId);

        if (!chat) {
            return res.status(400).json({
                success: false,
                message: 'Chat not found',
            });
        }

        if (!chat.groupChat) {
            return res.status(402).json({
                success: false,
                message: 'This is not a group chat',
            });
        }

        if (chat.creator.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only Admin Can Add New Members',
            }); 
        }

        const allNewMembersPromise = members.map(member => User.findById(member, "userName"));
        const allNewMembers = await Promise.all(allNewMembersPromise);

        if (allNewMembers.includes(null)) {
            return res.status(400).json({
                success: false,
                message: 'One or more members not found',
            });
        }

        chat.members.push(...allNewMembers.map((member) => member._id));

        if (chat.members.length > 100) {
            return res.status(400).json({
                success: false,
                message: 'Maximum Group Members Limit reached',
            });
        }

        await chat.save();

        const allMembersName = allNewMembers.map((member) => member.userName).join(", ");

        emitEvent(req, ALERT, chat.members, `${allMembersName} has been added to the group by ${req.user.email}`);

        res.status(201).json({
            success: true,
            chat,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

exports.removeMembers = async (req, res) => {
    try {
        console.log('Request Body:', req.body); // Debugging line
        console.log('Request User:', req.user); // Debugging line

        const { ChatId, members } = req.body;

        if (!Array.isArray(members) || members.length < 1) {
            return res.status(400).json({
                success: false,
                message: 'At least one member must be specified for removal',
            });
        }
        console.log("req.user.id", req.user.id);
   
        const chat = await Chat.findById(ChatId);

        if (!chat) {
            return res.status(400).json({
                success: false,
                message: 'Chat not found',
            });
        }

        if (!chat.groupChat) {
            return res.status(402).json({
                success: false,
                message: 'This is not a group chat',
            });
        }

        if (chat.creator.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only Admin Can Remove Members',
            }); 
        }

        // Remove specified members from the chat's members list
        chat.members = chat.members.filter(member => !members.includes(member.toString()));

        // Check if the members count is below the minimum required
        if (chat.members.length < 3) {
            return res.status(400).json({
                success: false,
                message: 'A group must have at least 3 members',
            });
        }

        await chat.save();

        const removedMembers = await User.find({
            _id: { $in: members }
        }, "userName");

        const removedMembersNames = removedMembers.map(member => member.userName).join(",");

        emitEvent(req,
            ALERT,
            chat.members,
            `${removedMembersNames} has been removed from the group by ${req.user.userName}`
        );
    
        res.status(201).json({
            success: true,
            message: 'Members removed successfully',
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.leaveGroup = async (req, res) => {
    try {
        console.log('Request Body:', req.body);
        console.log('Request User:', req.user);

        const { ChatId } = req.body;

        const chat = await Chat.findById(ChatId);

        if (!chat) {
            return res.status(400).json({
                success: false,
                message: 'Chat not found',
            });
        }

        if (!chat.groupChat) {
            return res.status(402).json({
                success: false,
                message: 'This is not a group chat',
            });
        }

        const userId = req.user.id;

        if (!chat.members.includes(userId)) {
            return res.status(403).json({
                success: false,
                message: 'You are not a member of this group',
            });
        }

        // Remove the user from the group members
        chat.members = chat.members.filter(member => member.toString() !== userId.toString());

        // If the user is the creator, assign a new random creator
        if (chat.creator.toString() === userId.toString()) {
            if (chat.members.length > 0) {
                const newCreatorIndex = Math.floor(Math.random() * chat.members.length);
                chat.creator = chat.members[newCreatorIndex];
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot leave group as the only member and creator',
                });
            }
        }

        await chat.save();

        emitEvent(req,
            ALERT,
            chat.members,
            `${req.user.userName} has left the group`
        );

        res.status(200).json({
            success: true,
            message: 'You have left the group successfully',
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.deleteGroup = async (req, res) => {
    try {
        const {id: ChatId } =req.params;

        // Find the chat
        const chat = await Chat.findById(ChatId);

        if (!chat) {
            return res.status(400).json({
                success: false,
                message: 'Chat not found',
            });
        }

        // Check if the user is the creator of the group
        if (chat.creator.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the creator can delete the group',
            });
        }

        // Find all messages associated with the chat
        const messages = await Message.find({ chat: ChatId });

        // Extract Cloudinary public IDs from the messages
        const publicIds = messages
            .filter(message => message.attachment && message.attachment.public_id)
            .map(message => message.attachment.public_id);

        // Delete files from Cloudinary
        if (publicIds.length > 0) {
            await deleteFilesFromCloudinary(publicIds);
        }

        // Delete messages associated with the chat
        await Message.deleteMany({ chat: ChatId });

        // Delete the chat
        await Chat.findByIdAndDelete(ChatId);

        res.status(200).json({
            success: true,
            message: 'Group deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting group:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.renameGroup = async (req, res) => {
    try {
        const { ChatId, newName } = req.body;

        // Validate inputs
        if (!ChatId || !newName) {
            return res.status(400).json({
                success: false,
                message: 'ChatId and newName are required',
            });
        }

        // Find the chat
        const chat = await Chat.findById(ChatId);

        if (!chat) {
            return res.status(400).json({
                success: false,
                message: 'Chat not found',
            });
        }

        // Check if the user is the creator of the group
        if (chat.creator.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Only the creator can rename the group',
            });
        }

        // Rename the chat
        chat.Name = newName;
        await chat.save();

        res.status(200).json({
            success: true,
            message: 'Group renamed successfully',
            chat,
        });
    } catch (error) {
        console.error('Error renaming group:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.sendAttachment = async (req, res) => {
    try {
        const { ChatId } = req.body;
        
        // Validate inputs
        if (!ChatId) {
            return res.status(400).json({
                success: false,
                message: 'ChatId required',
            });
        }

        const chat = await Chat.findById(ChatId).populate("members", "userName");
        const me = await User.findById(req.user.id, "userName");
     


        const files = req.files || [];

        if (files.length < 1) {
            return res.status(401).json({
                success: false,
                message: 'File required',
            });
        }
       
        const attachments =await uploadFilesToCloudinary(files);
       
        console.log("attachements",attachments);
        const messageData = {
            content:"",
            attachments,
            sender: req.user.id,
            chat: ChatId,
             // Assuming a single attachment for simplicity
        };

        const messageForRealTime = {
            ...messageData,
            sender: {
                _id:me._id,

                userName: me.userName,
            },
            chat: ChatId,
        };
        console.log("messageData",messageData);
        const message = await Message.create(messageData);
console.log("mesage",message);
       
        emitEvent(req, NEW_MESSAGE, chat.members, {
            message: messageForRealTime,
            ChatId,
          });
        
          emitEvent(req, NEW_MESSAGE_ALERT, chat.members, { ChatId });

        res.status(200).json({
            success: true,
            message: 'Attachment sent successfully',
            message: message
        });
    } catch (error) {
        console.error('Error sending attachment:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

exports.getChatDetails = async (req, res) => {
    try {
        const { id: chatId } = req.params;

        // Validate chatId
        if (!chatId) {
            return res.status(400).json({
                success: false,
                message: 'Chat ID is required',
            });
        }
        console.log("chat id",chatId);
        let chat;

        if (req.query.populate) {
            // Find the chat by ID and populate members
            chat = await Chat.findById(chatId)
                .populate('members', 'userName image');
        } else {
            // Find the chat by ID without populating members
            chat = await Chat.findById(chatId);
        }
        console.log("chat",chat);
        // Check if chat exists
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found',
            });
        }

        let responseChat = chat.toObject();

        if (req.query.populate) {
            // Modify members array to include image URLs
            responseChat.members = chat.members.map(({ _id, userName, image }) => ({
                _id,
                userName,
                image: image.url,
            }));
        }

        // Return the chat details with modified members if populated
        res.status(200).json({
            success: true,
            chat: responseChat,
        });
    } catch (error) {
        console.error('Error fetching chat details:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

exports.getMessage = async (req, res) => {
    try {
        const { id: ChatId } = req.params;
        const { page = 1 } = req.query;
        const resultPerPage = 20;
        const skip = (page - 1) * resultPerPage;

        const [messages, totalMessagesCount] = await Promise.all([
            Message.find({ chat: ChatId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(resultPerPage)
                .populate("sender", "userName image")
                .lean(),
            Message.countDocuments({ chat: ChatId }),
        ]);

        const totalPages = Math.ceil(totalMessagesCount / resultPerPage);

        res.status(200).json({
            success: true,
            messages: messages.reverse(),
            totalPages,
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

