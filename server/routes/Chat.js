const express = require("express");
const router = express.Router();
const { auth } = require("../midleware/auth");
const { attachmentsMulter }= require("../midleware/multer");
const { groupChat, 
    getMyChats, 
    getMyGroups ,
    addMembers,
    removeMembers,
    leaveGroup,
    deleteGroup,
    renameGroup,
    sendAttachment,
    getChatDetails,
    getMessage
 } = require("../controllers/Chat");

router.post("/groupChat", auth, groupChat);
router.get("/getMyChats", auth, getMyChats);
router.get("/getMyGroups", auth, getMyGroups);
router.put("/addMembers", auth, addMembers);
router.delete("/removeMembers", auth, removeMembers );
router.post("/leaveGroup", auth, leaveGroup );
//router.delete("/deleteGroup", auth, deleteGroup);
router.put("/renameGroup", auth, renameGroup);// in rename we are using different route while in video it has been done by id
router.post("/sendAttachment",auth,attachmentsMulter,sendAttachment);
router.route("/:id").get(auth,getChatDetails).delete(auth,deleteGroup);   
router.get("/getMessage/:id",auth,getMessage);                                                                                           

module.exports = router;
