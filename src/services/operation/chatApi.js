import { apiConnector } from "../apiconnectors";
import { toast } from "react-hot-toast";
import { setLoading } from "../../slices/authSlice";
import { chatEndpoints } from "../apis"
import { setChats } from "../../slices/chatSlice";

 const {
    CREATE_GROUP_CHAT_API,
    GET_MY_CHATS_API,
    GET_MY_GROUPS_API,
    ADD_MEMBERS_API,
    REMOVE_MEMBERS_API,
    LEAVE_GROUP_API,
    RENAME_GROUP_API,
    SEND_ATTACHMENT_API,
    GET_CHAT_DETAILS_API,
    DELETE_GROUP_API,
    GET_MESSAGE_API,
  }=chatEndpoints;


  export function getMyChats(token) {
    return async (dispatch) => {
      const toastId = toast.loading("Fetching chats...");
      dispatch(setLoading(true));
  
      try {
        const response = await apiConnector("GET", GET_MY_CHATS_API, null, {
          Authorization: `Bearer ${token}`,
        });
  
        console.log("GET_MY_CHATS API RESPONSE:", response);
  
        if (!response.data.success) {
          throw new Error(response.data.message);
        }
  
        // Extract chats from response
        const chats = response.data.chats;
  
        // Dispatch action or handle chats as needed
        // For example, dispatch an action to update state with chats
        // dispatch(updateChats(chats));
        
        // Or simply return chats
        dispatch(setChats(chats));
        return chats;
      } catch (error) {
        console.error("GET_MY_CHATS API ERROR:", error);
        toast.error("Failed to fetch chats");
      } finally {
        toast.dismiss(toastId);
        dispatch(setLoading(false));
      }
    };
  }

  export function getChatDetails(chatId, token, populate = false) {
    return async (dispatch) => {
      const toastId = toast.loading("Fetching chat details...");
      dispatch(setLoading(true));
  
      try {
        const url = `${GET_CHAT_DETAILS_API(chatId)}${populate ? '?populate=true' : ''}`;
        const response = await apiConnector(
          "GET",
          url,
          null,
          {
            Authorization: `Bearer ${token}`,
          }
        );
  
        console.log("GET_CHAT_DETAILS API RESPONSE:", response);
  
        if (!response.data.success) {
          throw new Error(response.data.message);
        }
  
        // Extract chat from response
        const chat = response.data.chat;
  
        // Dispatch action to update state with chat details
        //dispatch(setChatDetails(chat));
        return chat;
      } catch (error) {
        console.error("GET_CHAT_DETAILS API ERROR:", error);
        toast.error("Failed to fetch chat details");
      } finally {
        toast.dismiss(toastId);
        dispatch(setLoading(false));
      }
    };
  }


  export function getMessages(chatId, page = 1, token) {
    return async (dispatch) => {
      const toastId = toast.loading("Fetching messages...");
      dispatch(setLoading(true));
  
      try {
        const url = GET_MESSAGE_API(chatId, page);
        const response = await apiConnector(
          "GET",
          url,
          null,
          {
            Authorization: `Bearer ${token}`,
          }
        );
  
        console.log("GET_MESSAGES API RESPONSE:", response);
  
        if (!response.data.success) {
          throw new Error(response.data.message);
        }
  
        // Extract messages and totalPages from response
        const { messages, totalPages } = response.data;
  
        // Dispatch action to update state with messages
        //dispatch(addMessages(messages));
        return { messages, totalPages };
      } catch (error) {
        console.error("GET_MESSAGES API ERROR:", error);
        toast.error("Failed to fetch messages");
      } finally {
        toast.dismiss(toastId);
        dispatch(setLoading(false));
      }
    };
  }

  export async function sendAttachment(formData, token) {
    const toastId = toast.loading("Sending attachment...");
  
    try {
      // Make the API call to send the attachment
      const response = await apiConnector(
        "POST",
        SEND_ATTACHMENT_API,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
  
      console.log("SEND_ATTACHMENT API RESPONSE:", response.data);
  
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
  
      return response.data; // You can adjust this depending on what you need to return
  
    } catch (error) {
      console.error("SEND_ATTACHMENT API ERROR:", error);
      toast.error("Failed to send attachment");
      return { success: false, message: error.message };
    } finally {
      toast.dismiss(toastId);
    }
  }

  export function getMyGroups(token) {
    return async (dispatch) => {
      const toastId = toast.loading('Fetching groups...');
      dispatch(setLoading(true));
  
      try {
        const response = await apiConnector(
          'GET',
          GET_MY_GROUPS_API,
          null,
          {
            Authorization: `Bearer ${token}`,
          }
        );
  
        console.log('GET_GROUPS API RESPONSE:', response);
  
        if (!response.data.success) {
          throw new Error(response.data.message);
        }
  
        const { groups } = response.data;
  
        // dispatch(setGroups(groups));
        return groups;
      } catch (error) {
        console.error('GET_GROUPS API ERROR:', error);
        toast.error('Failed to fetch groups');
        // dispatch(setError('Failed to fetch groups'));
      } finally {
        toast.dismiss(toastId);
        dispatch(setLoading(false));
      }
    };
  }