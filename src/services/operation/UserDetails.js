import {toast} from "react-hot-toast"
import { setIsUser, setLoading, setToken } from '../../slices/authSlice'
//import { resetCart } from "../../slices/cartSlice " 
import {setUser}  from "../../slices/profileSlice"
import { apiConnector } from "../apiconnectors"
import { userEndpoints } from "../apis"

const {

 
    LOGIN_API,
    SIGNUP_API,
    SEND_OTP_API,
    LOGOUT_API,
    SEND_FRIEND_REQUEST_API,
    HANDLE_FRIEND_REQUEST_API,
    SEARCH_USER_API,
    GET_NOTIFICATION_API
 
  
  }  = userEndpoints

export function Search(userName) {
  return async () => {
   

    try {
      const response = await apiConnector("get", SEARCH_USER_API, null, null, { userName });

      console.log("Search_api_response", response);

      if (response.data.success) {
        return response.data;
       // Dismiss loading toast
        // Assuming you dispatch an action to update the state with users
        // dispatch({ type: 'UPDATE_USERS', payload: response.data.users });
      } else {
        throw new Error(response.data.message); // Throw error to be caught in catch block
      }
    } catch (error) {
      console.error("Search_api ERROR:", error);
    // Dismiss loading toast
      toast.error("Could Not find user "); // Display error toast
    }
   
  };
}

export function sendFriendRequest(receiverId, token) {
  return async (dispatch) => {
    const toastId = toast.loading("Sending friend request...");
    dispatch(setLoading(true));

    try {
      const response = await apiConnector("POST",SEND_FRIEND_REQUEST_API, { receiverId }, {
        Authorization: `Bearer ${token}`,
      });

      console.log("SEND_FRIEND_REQUEST API RESPONSE............", response);

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      toast.success("Friend request sent successfully.");
    } catch (error) {
      console.log("SEND_FRIEND_REQUEST API ERROR............", error);
      toast.error("Already sent");
    } finally {
      toast.dismiss(toastId);
      dispatch(setLoading(false));
    }
  };
}

export function getNotifications(token) {
  return async (dispatch) => {
    const toastId = toast.loading("Fetching notifications...");
    dispatch(setLoading(true));

    try {
      const response = await apiConnector("GET", GET_NOTIFICATION_API, null, {
        Authorization: `Bearer ${token}`,
      });

      console.log("GET_NOTIFICATIONS API RESPONSE:", response);

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      // Extract notifications from response
      const notifications = response.data.requests; // Assuming response has 'requests' array

      // Dispatch action or handle notifications as needed
      // For example, dispatch an action to update state with notifications
      // dispatch(updateNotifications(notifications));
      
      // Or simply return notifications
      return notifications;
    } catch (error) {
      console.error("GET_NOTIFICATIONS API ERROR:", error);
      toast.error("Failed to fetch notifications");
    } finally {
      toast.dismiss(toastId);
      dispatch(setLoading(false));
    }
  };
}

export const handleFriendRequest = async (requestId, action, token) => {
  const toastId = toast.loading('Processing friend request...');

  try {
    const response = await apiConnector('POST',HANDLE_FRIEND_REQUEST_API, { requestId, action }, {
      Authorization: `Bearer ${token}`,
    });

    console.log('HANDLE_FRIEND_REQUEST API RESPONSE:', response);

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success('Friend request processed successfully.');

    return response.data; // Return the response data, which may include updated details
  } catch (error) {
    console.error('HANDLE_FRIEND_REQUEST API ERROR:', error);
    toast.error('Failed to process friend request.');

    throw error; // Rethrow the error for handling in components
  } finally {
    toast.dismiss(toastId); // Dismiss the loading toast
  }
};