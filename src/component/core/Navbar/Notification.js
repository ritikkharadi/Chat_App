import React from 'react'
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { getNotifications } from '../../../services/operation/UserDetails';
import { useState } from 'react';
import {formattedDate} from "../../../Utils/dateFormator"
import {toast} from "react-hot-toast"
import {handleFriendRequest} from "../../../services/operation/UserDetails"
const Notification = () => {
  const dispatch = useDispatch();
  const token = useSelector(state => state.auth.token); // Assuming token is stored in Redux state
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (token) {
          const response = await dispatch(getNotifications(token));
          // Handle notifications directly if needed
          console.log("RESPONSE:", response);

          // Example: Update local state with fetched notifications
          if (response ) {
            setNotifications(response);
          } else {
            console.error("Failed to fetch notifications:", response?.data.message || "Unknown error");
          }
        }
      } catch (error) {
        console.error("Error fetching notifications:", error.message);
      }
    };

    fetchNotifications();
  }, [dispatch, token]);

  const handleAccept = async (requestId, action) => {
    try {
      const response = await handleFriendRequest(requestId, action, token);
      // Handle success (e.g., update UI or state)
      console.log('Friend request accepted:', response);

      // Update local state or refetch notifications after successful action
      const updatedNotifications = notifications.map(notification =>
        notification.id === requestId ? { ...notification, status: 'accepted' } : notification
      );
      setNotifications(updatedNotifications);

      toast.success('Friend request accepted successfully.');
    } catch (error) {
      // Handle error (e.g., show error message)
      console.error('Failed to accept friend request:', error);
      toast.error('Failed to accept friend request.');
    }
  };

  const handleReject = async (requestId, action) => {
    try {
      const response = await handleFriendRequest(requestId, action, token);
      // Handle success (e.g., update UI or state)
      console.log('Friend request rejected:', response);

      // Update local state or refetch notifications after successful action
      const updatedNotifications = notifications.filter(notification => notification.id !== requestId);
      setNotifications(updatedNotifications);

      toast.success('Friend request rejected successfully.');
    } catch (error) {
      // Handle error (e.g., show error message)
      console.error('Failed to reject friend request:', error);
      toast.error('Failed to reject friend request.');
    }
  };

  console.log("notification",notifications);

  // Render notifications UI based on local state
  return (
   
      <div className="w-11/12 max-w-[350px] rounded-lg border border-richblack-400 bg-pure-greys-5 p-6 shadow-md">
        <h2 className="text-xl font-bold mb-4">Notifications</h2>
        {notifications.length === 0 ? (
          <p className="text-gray-600">No notifications</p>
        ) : (
          <ul>
            {notifications.map(notification => (
              <li key={notification.id} className="mb-2">
                <div className="flex items-center">
                  <img src={notification.sender.image} alt={notification.sender.userName} className="w-8 h-8 rounded-full mr-2" />
                  <div>
                    <p className="font-semibold">{notification.sender.userName}</p>
                    <p className="text-sm text-gray-500">{notification.status}</p>
                    <p className="text-xs text-gray-400">{formattedDate(notification.createdAt)}</p>
                    {notification.status === 'pending' && (
                      <div className="mt-2">
                        <button onClick={() => handleAccept(notification.id, true)} className="bg-blue-500 text-white px-3 py-1 rounded mr-2">Accept</button>
                        <button onClick={() => handleReject(notification.id, false)} className="bg-red-500 text-white px-3 py-1 rounded">Reject</button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
  
  );
};

export default Notification;