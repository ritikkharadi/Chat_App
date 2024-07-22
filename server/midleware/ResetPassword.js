const User=require("../models/User");
const mailsender=require("../utils/MailSender");
const bcrypt=require("bcrypt");

//send mail to reset password
exports.resetPasswordToken = async (req, res) => {
    try {
        // Data fetch
        const  email  = req.body;

        // Find user by email
        let user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'your email is not registered',
            });
        }
        // generate token 
        const token=crypto.randomUUID();

        //update user by adding token and expire time 
        const updatedDetails=await User.findByIdAndUpdate({email :email},
                                                            {token:token,
                                                            resetPasswordExpires:Date.now()+5*60*1000,},
                                                            {new:true,}
                                                               );
        // creat url
        const url=`http://localhost:3000/update-password/${token}`

        //send mail 
        const mailResponse = await mailSender(email, "Password reset link", `password reset link: ${url}`);
        console.log("Mail sent successfully:", mailResponse);

        return res.status(200).json({
            success: true,
            message: 'mail sent successfully ,please check mail and reset password',
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'something went wrong in sending mail and reseting password',
        });
    }
}

//reset password
exports.resetPassword = async (req, res) => {
    try {
        // Data fetch
        const { password, confirmNewPassword, token } = req.body;

        // Validation on password fields
        if (!password || !confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please fill all the details carefully',
            });
        }

        // Check if new password is same as old password
        if (password !== confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match',
            });
        }

        // Get user details from db using token
        let userDetails = await User.findOne({ token });

        // If no entry in user
        if (!userDetails) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired token',
            });
        }

        // Token time check
        if (userDetails.resetPasswordExpires < Date.now()) {
            return res.status(400).json({
                success: false,
                message: 'Token is expired, please regenerate your token',
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Password update
        await User.findOneAndUpdate(
            { token },
            { password: hashedPassword },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: 'Password reset successfully',
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while resetting the password',
        });
    }
};
