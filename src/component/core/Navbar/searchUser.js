

// Search.js
import { FaPlus } from "react-icons/fa6";
import React, { useState } from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search } from "../../../services/operation/UserDetails";
import {toast} from "react-hot-toast";// Assuming you are using react-toastify for notifications
import InfiniteScroll from "react-infinite-scroll-component";
import { sendFriendRequest } from '../../../services/operation/UserDetails';
import { useSocket } from "../../../socket";


const SearchUser = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  const fetchSearchedUsers = async () => {
    try {
      const response = await dispatch(Search(searchTerm.trim())); // Call the Search function

      console.log("response", response);

      // Check if response is valid and update results
      if (response && response.success) {
        setResults(response.users); // Update results with users data
      } else {
        console.error("Search_api ERROR:", response?.message || "Could not find users");
        toast.error(response?.message || "Could not find users");
      }
    } catch (error) {
      console.error("Search_api ERROR:", error.message);
      toast.error("An error occurred while searching users");
    }
  };

  const handleSendFriendRequest = async (receiverId) => {
    try {
      await dispatch(sendFriendRequest(receiverId, token));
      
    } catch (error) {
      console.error("Error sending friend request:", error.message);
     
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim() !== '') {
        fetchSearchedUsers();
      } else {
        setResults([]); // Clear results if search term is empty
      }
    }, 300); // Delay the search to avoid rapid API calls on each keystroke

    return () => clearTimeout(timer); // Clear the timer on component unmount or when searchTerm changes
  }, [searchTerm]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-4">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={fetchSearchedUsers}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
        >
          Search
        </button>
      </div>

      <div className="flex flex-col gap-4 max-h-[450px] overflow-y-auto">
        {results.length > 0 ? (
          results.map((user) => (
            <div key={user._id} className="p-4 border rounded-md shadow-md flex items-center justify-between">
              <div className="flex items-center">
                <img
                  src={user.image || `https://avatars.dicebear.com/api/initials/${user.firstName[0]}${user.lastName[0]}.svg?background=%23${Math.floor(Math.random()*16777215).toString(16)}`}
                  className="h-10 w-10 object-cover rounded-full mr-4"
                />
                <div>
                  <p className="text-lg font-semibold">{user.firstName} {user.lastName}</p>
                  <p className="text-md font-normal">{user.userName}</p>
                </div>
              </div >
              <div className=" rounded-full bg-blue-500">  
                <FaPlus className="cursor-pointer text-3xl text-white" onClick={() => handleSendFriendRequest(user._id)} /></div>
             
            </div>
          ))
        ) : (
          <p className="text-lg text-gray-600">No users found</p>
        )}
      </div>
    </div>
  );
};

export default SearchUser;