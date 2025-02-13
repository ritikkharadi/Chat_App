import React from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import { useEffect,useCallback } from 'react';
import { getChatDetails,getMessages } from '../services/operation/chatApi';
import {  useSocket} from "../socket";
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import { formattedDate } from '../Utils/dateFormator';
import FileMenu from "../component/core/Chat/fileMenu";
import { setIsFileMenu } from "../slices/other";
import { MdOutlineAttachFile } from "react-icons/md";
import {
  ALERT,
  CHAT_JOINED,
  CHAT_LEAVED,
  NEW_MESSAGE,
  START_TYPING,
  STOP_TYPING,
} from "../constants/events";

import TypingLoader from '../component/core/Chat/TypingLoader';
import img from "../Assets/peakpx (3).jpg"

const Chat = () => {
  const { chatId } = useParams();
  const dispatch = useDispatch();
  const token = useSelector(state => state.auth.token);
  const socket = useSocket(); // Custom hook to get socket instance
  const navigate = useNavigate();

  const [chatDetails, setChatDetails] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [oldMessageChunks, setOldMessageChunks] = useState([]);
  const [page, setPage] = useState(1);
  const [IamTyping, setIamTyping] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const typingTimeout = useRef(null);
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const [user, setUser] = useState(null);
  const [fileMenuAnchor, setFileMenuAnchor] = useState(null);
  const [userStatus, setUserStatus] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Initialize user from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  // Fetch chat details
  useEffect(() => {
    if (token && chatId) {
      dispatch(getChatDetails(chatId, true))
        .then(chat => setChatDetails(chat))
        .catch(error => console.error('Failed to fetch chat details:', error));
    }
  }, [dispatch, token, chatId]);

  // Fetch initial messages
  useEffect(() => {
    if (token && chatId) {
      dispatch(getMessages(chatId, page))
        .then(oldMessages => setOldMessageChunks(prev => [...prev, ...oldMessages.messages]))
        .catch(error => console.error('Failed to fetch messages:', error));
    }
  }, [dispatch, token, chatId, page]);

  // Handle message input change
  const messageOnChange = (e) => {
    setMessage(e.target.value);
    if (!IamTyping) {
      socket.emit('START_TYPING', { chatId });
      setIamTyping(true);
    }
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('STOP_TYPING', { chatId });
      setIamTyping(false);
    }, 2000);
  };

  // Handle message submission
  const submitHandler = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = { chatId, content: message, token };

    socket.emit('NEW_MESSAGE', newMessage, (response) => {
      if (response && response.messageForRealTime) {
        setMessages(prevMessages => [...prevMessages, response.messageForRealTime]);
      } else {
        console.error("Failed to send message:", response);
      }
    });

    setMessage("");
  };

  const handleFileOpen = (e) => {
    dispatch(setIsFileMenu(true));
    setFileMenuAnchor(e.currentTarget);
  };

  // Handle socket events
  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (messageForRealTime) => {
      setMessages(prevMessages => [...prevMessages, messageForRealTime]);
    };

    const handleUserStatusChange = (data) => {
      if (Array.isArray(data)) {
        setOnlineUsers(data);
        const userStatusMap = data.reduce((acc, userId) => {
          acc[userId] = true;
          return acc;
        }, {});
        setUserStatus(userStatusMap);
      } else {
        setUserStatus(prevStatus => ({ ...prevStatus, [data.userId]: true }));
        setOnlineUsers(prevOnlineUsers => {
          if (!prevOnlineUsers.includes(data.userId)) {
            return [...prevOnlineUsers, data.userId];
          }
          return prevOnlineUsers;
        });
      }
    };

    const handleUserOffline = (data) => {
      setUserStatus(prevStatus => ({ ...prevStatus, [data.userId]: false }));
      setOnlineUsers(prevOnlineUsers => prevOnlineUsers.filter(id => id !== data.userId));
    };

    socket.on('RECEIVE_MESSAGE', handleMessageReceived);
    socket.on('USER_ONLINE', handleUserStatusChange);
    socket.on('USER_OFFLINE', handleUserOffline);
    socket.on('ONLINE_USERS', handleUserStatusChange);

    return () => {
      socket.off('RECEIVE_MESSAGE', handleMessageReceived);
      socket.off('USER_ONLINE', handleUserStatusChange);
      socket.off('USER_OFFLINE', handleUserOffline);
      socket.off('ONLINE_USERS', handleUserStatusChange);
    };
  }, [socket]);

  // Join chat room
  useEffect(() => {
    if (user && chatId) {
      socket.emit('CHAT_JOINED', { userId: user._id, chatId });

      return () => {
        setMessages([]);
        setMessage("");
        setOldMessageChunks([]);
        setPage(1);
        socket.emit('CHAT_LEAVED', { userId: user._id, chatId });
      };
    }
  }, [chatId, socket, user]);

  // Scroll to the bottom when messages change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Navigate away if there is an error in chat details
  useEffect(() => {
    if (chatDetails?.isError) {
      navigate("/");
    }
  }, [chatDetails?.isError, navigate]);

  // Event listeners for real-time features
  const newMessagesListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;
      setMessages((prev) => [...prev, data.message]);
    },
    [chatId]
  );

  const startTypingListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;
      setUserTyping(true);
    },
    [chatId]
  );

  const stopTypingListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;
      setUserTyping(false);
    },
    [chatId]
  );

  const alertListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;
      const messageForAlert = {
        content: data.message,
        sender: {
          _id: "djasdhajksdhasdsadasdas",
          name: "Admin",
        },
        chat: chatId,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, messageForAlert]);
    },
    [chatId]
  );

  useEffect(() => {
    socket.on('NEW_MESSAGE', newMessagesListener);
    socket.on('START_TYPING', startTypingListener);
    socket.on('STOP_TYPING', stopTypingListener);
    socket.on('ALERT', alertListener);

    return () => {
      socket.off('NEW_MESSAGE', newMessagesListener);
      socket.off('START_TYPING', startTypingListener);
      socket.off('STOP_TYPING', stopTypingListener);
      socket.off('ALERT', alertListener);
    };
  }, [socket, newMessagesListener, startTypingListener, stopTypingListener, alertListener]);

  const allMessages = [...oldMessageChunks, ...messages];

  if (!chatDetails) {
    return (
      <div>
        <img src={img} className='h-screen' alt="Loading" />
      </div>
    );
  }

  const getRandomColor = () => {
    const colors = [
      'text-blue-500',
      'text-green-500',
      'text-yellow-500',
      'text-red-500',
      'text-purple-500',
      'text-pink-500',
      'text-indigo-500',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div>
    {chatDetails ? (
      <>
    <div className="flex flex-col h-screen">
 
    <div className="bg-gray-800  p-3 flex justify-between items-center bg-white  border-b-2 border-pure-greys-25">
          <h2 className="text-lg text-black font-semibold">{chatDetails.Name}</h2>
          {IamTyping && <div className=' text-black'> i am typing</div>}
          {!chatDetails.groupChat && chatDetails.members.length === 2 && (
    <div className="text-green-500">
        {chatDetails.members.filter(memberId => memberId !== user._id).some(memberId => onlineUsers.includes(memberId))
            ? <div className=' text-green-400'>online</div>
            : <div className='  text-red-900'>offline </div>
        }
    </div>
)}
         
        </div>

      <div className="flex-1 overflow-y-auto bg-gray-50">
        {/* Chat Header */}
        

        {/* Messages */}
        <div className="p-4">
          {allMessages.map((msg, index) => (
            <div key={index} className={`mb-4 `}>
              {msg.sender._id === user._id ? (
                // Message sent by the current user
                <div className={`ml-auto bg-blue-500 text-white rounded-lg p-3 max-w-xs`}>
                  <p>{msg.content}</p>
                  <div className="flex justify-end">
                    <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ) : (
                // Message sent by another user
                <div className="ml-3 bg-gray-100 rounded-lg border border-gray-200 p-3 max-w-xs flex shadow-lg">
    <div className="ml-3 flex flex-col">
      <p className={`font-semibold text-blue-500 ${chatDetails.groupChat ? getRandomColor() : ''}`}>{msg.sender.userName}</p>
      <p className="text-gray-800">{msg.content}</p>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleTimeString()}</span>
      </div>
    </div>
  </div>
              )}
            </div>
          ))}
          <div ref={bottomRef}></div>
        </div>
      </div>

      {/* Input Container */}
      <div className="bg-white p-4 flex items-center">

      <MdOutlineAttachFile  onClick={handleFileOpen}
/>
        <form onSubmit={submitHandler} className="flex-1">
          <input
            type="text"
            value={message}
            onChange={messageOnChange}
            placeholder="Type a message..."
            className="w-full px-3 py-2 rounded-lg border-richblack-50 border-2 focus:outline-none focus:border-none focus:ring-2 focus:ring-blue-500"
          />
        </form>
        <button
          type="submit"
          className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          onClick={submitHandler}
        >
          Send
        </button>
      </div>
      {/* <FileMenu anchorE1={fileMenuAnchor} chatId={chatId} /> */}
      {userTyping && <div className="p-2 text-gray-400">Someone is typing...</div>}
    </div>
      
      </>
    ) : (
      <div className="p-4">Loading chat details...</div>
    )}
  </div>
  
  );
};

export default Chat;