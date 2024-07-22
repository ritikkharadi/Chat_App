const mongoose=require("mongoose");

const userSchema=new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        trim:true,
    },
    lastName:{
        type:String,
        required:true,
        trim:true,
    },
    userName: {
        type: String,
        unique: true,
        sparse: true, // Allow multiple null values
    },
    email:{
        type:String,
        required:true,
        trim:true,
    },
    password:{
        type:String,
        required:true,
       
    },
    confirmPassword:{
        type:String,
        required:true,
        select:false,
    },
 

    image:{
        public_id:{
        type:String,
       // required:true, 
        },
       url:{
        type:String,
       // required:true,
       }
    },
    
    bio:{
        type:String,
    }
   
  
    // resetPasswordExpires:{
    //     type:Date,
    // }
},
{
    timestamps:true,
});
module.exports=mongoose.model("User",userSchema);