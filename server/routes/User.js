
const express = require("express")
const router = express.Router()
const {auth} =require('../midleware/auth');

// Import the required controllers and middleware functions
const {
   login,
  signup,
   sendOtp,
   logout,
  
//   changePassword,
} = require("../controllers/Auth")
// const {
//   resetPasswordToken,
//   resetPassword,
// } = require("../controllers/ResetPassword")

const{
 searchUser,sendFriendRequest,
 handleFriendRequest,getNotification ,getMyFriends
}=require('../controllers/User');
// const { auth } = require("../midleware/auth")

// Routes for Login, Signup, and Authentication

// ********************************************************************************************************
//                                      Authentication routes
// ********************************************************************************************************

// Route for user login
 router.post("/login", login)//done

// Route for user signup
router.post("/signup",signup)//done

// Route for sending OTP to the user's email
 router.post("/sendotp",sendOtp)//done
 router.post("/logout",auth,logout);
 router.post("/sendFriendRequest",auth, sendFriendRequest );
 router.post("/handleFriendRequest",auth,handleFriendRequest);

 //route for searching user 
 router.get("/search",auth, searchUser );
 router.get("/getNotification",auth,getNotification );
 router.get("/getMyFriends",auth,getMyFriends );
// Route for Changing the password
// router.post("/changepassword", auth, changePassword)

// ********************************************************************************************************
//                                      Reset Password
// ********************************************************************************************************

// Route for generating a reset password token
// router.post("/reset-password-token", resetPasswordToken)

// // Route for resetting user's password after verification
// router.post("/reset-password", resetPassword)

// Export the router for use in the main application
module.exports = router