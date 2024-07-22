const express = require("express");
const router = express.Router();
const { auth } = require("../midleware/auth");
const { attachmentsMulter }= require("../midleware/multer");

const { getUserProfile
 } = require("../controllers/Profile");

router.get("/getUserProfile", auth, getUserProfile);
                                                                                         

module.exports = router;
