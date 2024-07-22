
const express = require("express")
const router = express.Router()



const{
    getAllUsers,getAllChats,getAllMessages ,dashboard,adminLogin,createAdmin
}=require('../controllers/Admin');

const{
    adminAuth
}=require('../midleware/AdminAuth');

router.post("/createAdmin",createAdmin );
router.post("/adminLogin",adminLogin );
 router.get("/getAllUsers",adminAuth,getAllUsers );
 router.get("/getAllChats",getAllChats );
 router.get("/getAllMessages",getAllMessages );
 router.get("/dashboard",dashboard );
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