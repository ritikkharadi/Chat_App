const User = require("../model/User");

exports.getUserProfile = async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Fetch user details from the database
      const userDetails = await User.findOne({ _id: userId }).select("_id userName image firstName lastName bio email createdAt");
      
      // Check if user details were found
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: "Could not find user",
        });
      }
      
      // Return user details in response
      return res.status(200).json({
        success: true,
        data: userDetails,
      });
    } catch (error) {
      // Handle any errors that occur
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
  