//signup route handler
const User=require('../model/User')
const OTP=require('../model/OTP');
const otpGenerator=require("otp-generator");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const mailSender = require('../utils/MailSender');
//const passwordUpdate =require('../mails/templetes/passwordUpdate');
require("dotenv").config();

//send otp
exports.sendOtp = async (req, res) => {
    try {
      // fetch email from request body
      const { email } = req.body;
  
      // check if user already exists
      const checkUserPresent = await User.findOne({ email });
      if (checkUserPresent) {
        return res.status(401).json({
          success: false,
          message: "User already exists",
        });
      }
  
      // generate OTP
      let otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      console.log("OTP generated successfully:", otp);
  
      // ensure OTP is unique
      let result = await OTP.findOne({ otp });
      while (result) {
        otp = otpGenerator.generate(6, {
          upperCaseAlphabets: false,
          lowerCaseAlphabets: false,
          specialChars: false,
        });
        result = await OTP.findOne({ otp });
      }
  
      // create OTP entry in the database
      const otpPayload = { email, otp };
      const otpBody = await OTP.create(otpPayload);
      console.log("OTP saved to DB:", otpBody);
  
      // send OTP email
      const title = "Your OTP Code";
      const body = `<p>Your OTP code is: <b>${otp}</b></p>`;
      await mailSender(email, title, body);
  
      return res.status(200).json({
        success: true,
        message: "OTP sent successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }


exports.signup = async (req, res) => {
    try {
        // Get data from request body
        const { firstName, lastName, email, password,  otp, confirmPassword,image,userName,bio } = req.body;
        console.log("pass",password);
        console.log("confirmpass",confirmPassword);
        console.log("req.body",req.body);
        // Validate if all required fields are provided
        if (!firstName || !lastName || !email || !password || !otp || !confirmPassword  ) {
            return res.status(403).json({
                success: false,
                message: 'All fields are required',
            });
        }

        // Check if password and confirmPassword match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Password and Confirm Password do not match',
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists',
            });
        }

        // Find the most recent OTP stored for the user
        const recentOtp = await OTP.findOne({ email }).sort({ createdAt: -1 });
        
        // Validate if OTP exists and matches
        if (!recentOtp) {
            return res.status(400).json({
                success: false,
                message: "OTP not found",
            });
        } 
        if (recentOtp.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }
 // do something for when user name is duplicate 
        // Secure password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Creating profile details
        // const profileDetails = await Profile.create({
        //     gender: null,
        //     dob: null,
        //     about: null,
        //     contactNumber: null,
        // });

        // Create user entry
        const user = await User.create({
            firstName,
            lastName,
            email,
            bio,
            password: hashedPassword,
            confirmPassword,
            // additionalDetails: profileDetails._id,
            //image: `http://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        });

        console.log("user",user);

        return res.status(200).json({
            success: true,
            message: 'User registered successfully',
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'User cannot be registered, please try again later',
        });
    }
}

//login

exports.login = async (req, res) => {
    try {
        // Data fetch
        const { email, password } = req.body;
        
        // Validation on email and password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please fill all the details carefully',
            });
        }

        // Check for registered user
        let user = await User.findOne({ email });
        console.log("user",user);
        // If not a registered user
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User is not registered',
            });
        }

        console.log(`Password provided: ${password}`);
        console.log(`Stored user password: ${user.password}`);

        // Verify password & generate a JWT token
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        console.log(`Password match status: ${isPasswordMatch}`);

        if (isPasswordMatch) {
            // Password match
            const payload = {
                email: user.email,
                id: user._id,
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "6h",
            });

            user = user.toObject();
            user.token = token;
            user.password = undefined;

            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            };

            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: 'User Logged in successfully',
            });
        } else {
            // Password does not match
            return res.status(403).json({
                success: false,
                message: "Password Incorrect",
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Login Failure',
        });
    }
};

exports.logout = async (req, res) => {
    try {
        // Clear the token cookie
        res.clearCookie('token');

        // Optionally, you can also invalidate the token stored on the client side

        res.status(200).json({
            success: true,
            message: 'User logged out successfully',
        });
    } catch (error) {
        console.error('Error logging out:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failure',
        });
    }
};
