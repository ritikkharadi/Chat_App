// console.log('Initial exports:', exports);
// console.log('Initial module.exports:', module.exports);
// const { getSocket } = require("../socket")


// exports.emitEvent = (req, event, users, data) => {
//     const io = req.app.get("io");
//     const userSockets = getSocket(users); // Get the socket IDs
//     userSockets.forEach((socketId) => {
//         if (socketId) {
//             io.to(socketId).emit(event, data);
//         }
//     });
// };