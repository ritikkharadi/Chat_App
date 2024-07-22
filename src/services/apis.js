const BASE_URL = "http://localhost:4000/api/v1";

// ADMIN ENDPOINTS
export const adminEndpoints = {
  CREATE_ADMIN_API: BASE_URL + "/admin/createAdmin",
  ADMIN_LOGIN_API: BASE_URL + "/admin/adminLogin",
  GET_ALL_USERS_API: BASE_URL + "/admin/getAllUsers",
  GET_ALL_CHATS_API: BASE_URL + "/admin/getAllChats",
  GET_ALL_MESSAGES_API: BASE_URL + "/admin/getAllMessages",
  DASHBOARD_API: BASE_URL + "/admin/dashboard",
};

// USER ENDPOINTS
export const userEndpoints = {
  LOGIN_API: BASE_URL + "/user/login",
  SIGNUP_API: BASE_URL + "/user/signup",
  SEND_OTP_API: BASE_URL + "/user/sendotp",
  LOGOUT_API: BASE_URL + "/user/logout",
  SEND_FRIEND_REQUEST_API: BASE_URL + "/user/sendFriendRequest",
  HANDLE_FRIEND_REQUEST_API: BASE_URL + "/user/handleFriendRequest",
  SEARCH_USER_API: BASE_URL + "/user/search",
  GET_NOTIFICATION_API: BASE_URL + "/user/getNotification",
};

// CHAT ENDPOINTS
export const chatEndpoints = {
  CREATE_GROUP_CHAT_API: BASE_URL + "/chat/groupChat",
  GET_MY_CHATS_API: BASE_URL + "/chat/getMyChats",
  GET_MY_GROUPS_API: BASE_URL + "/chat/getMyGroups",
  ADD_MEMBERS_API: BASE_URL + "/chat/addMembers",
  REMOVE_MEMBERS_API: BASE_URL + "/chat/removeMembers",
  LEAVE_GROUP_API: BASE_URL + "/chat/leaveGroup",
  RENAME_GROUP_API: BASE_URL + "/chat/renameGroup",
  SEND_ATTACHMENT_API: BASE_URL + "/chat/sendAttachment",
  GET_CHAT_DETAILS_API: (id) => BASE_URL + `/chat/${id}`,
  DELETE_GROUP_API: (id) => BASE_URL + `/chat/${id}`,
  GET_MESSAGE_API: (id) => BASE_URL + `/chat/getMessage/${id}`,
};

export const profileEndpoints = {
  GET_USER_PROFILE: BASE_URL + "/profile/getUserProfile",
  
};
// Export all endpoints as default
export default {
  adminEndpoints,
  userEndpoints,
  chatEndpoints,
  profileEndpoints
};
