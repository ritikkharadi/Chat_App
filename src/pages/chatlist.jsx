import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyChats } from '../services/operation/chatApi'; // Adjust the import based on your project structure
import { useNavigate } from 'react-router-dom';
import { FaUserGroup } from 'react-icons/fa6';
import { FaUser } from "react-icons/fa6";


const ChatList = () => {
  const dispatch = useDispatch();
  const token = useSelector(state => state.auth.token); // Assuming token is stored in Redux state
  const chats = useSelector(state => state.chat.chats); // Adjust based on your state structure
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      dispatch(getMyChats(token));
    }
  }, [dispatch, token]);

  const clickHandler = (chatID) => {
    console.log('hii');
    console.log("chatId",chatID);
    navigate(`/home/${chatID}`);
  };

  return (
    <div className="chat-list bg-white shadow-md border border-richblack-25">
      <h2 className="text-xl font-bold mb-4 ml-12">My Chats</h2>
      {chats.length === 0 ? (
        <p className="text-gray-600">No chats found</p>
      ) : (
        <ul className='ml-9'>
          {chats.map(chat => (
            <li key={chat._id} className="px-2" onClick={() => clickHandler(chat._id)} >
              <div className="flex items-center" >
                {chat.avatar[0] ? (
                  <img src={chat.avatar[0]} alt={chat.name} className="w-10 h-10 rounded-full mr-3 border border-gray-300" />
                ) : chat.groupChat ? (
                  <FaUserGroup className="w-10 h-10 text-gray-500 mr-3 rounded-full border border-gray-300 p-1" />
                ) : (
                  <FaUser className="w-10 h-10 text-gray-500 mr-3 rounded-full border border-gray-300 p-1" />
                )}
                <div>
                  <p className="font-semibold">{chat.name}</p>
                  {chat.groupChat ? (
                    <p className="text-sm text-gray-500">{chat.members.length} members</p>
                  ) : (
                    <p></p>
                  )}
                </div>
              </div>
              <div className='bg-richblack-25 h-[1px] w-full my-2'></div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChatList;