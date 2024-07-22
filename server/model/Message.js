const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        required: true,
    },
   content: {
        type: String,
       
    },
    attachment: {
        public_id:{
            type:String,
      //  required:true, 
        },
       url:{
        type:String,
       // required:true,
       }
    },
}
    ,{
        timestamps:true,
    });

module.exports = mongoose.model("Message", messageSchema);
