const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true,
    },
    userName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        
    },
    groupChat: {
        type: Boolean,
        default: false,
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
       
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }],
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
