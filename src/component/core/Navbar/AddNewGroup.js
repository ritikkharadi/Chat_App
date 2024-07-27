import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyGroups } from '../../../services/operation/chatApi';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MyGroupsComponent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Initialize useNavigate
  const token = localStorage.getItem('token'); // Adjust based on how you store your token
  const [myGroups, setMyGroups] = useState([]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        if (token) {
          const response = await dispatch(getMyGroups(token));
          console.log("RESPONSE:", response);

          // Example: Update local state with fetched groups
          if (response) {
            setMyGroups(response);
          } else {
            console.error("Failed to fetch groups:", response?.data.message || "Unknown error");
          }
        }
      } catch (error) {
        console.error("Error fetching groups:", error.message);
      }
    };

    fetchGroups();
  }, [dispatch, token]);

  const handleGroupClick = (groupId) => {
    navigate(`/home/${groupId}`);
  };

  return (
    <div className=' w-[500px] border-4 border-richblack-100 bg-specialBlue-100 rounded-lg max-h-[570px] overflow-y-auto'>
      <h2 className="text-xl font-bold mb-4 text-center my-2 text-white">My Groups</h2>
      <ul className="space-y-4">
        {myGroups.map((group) => (
          <li
            key={group._id}
            className="card  ml-9 rounded-md   "
            onClick={() => handleGroupClick(group._id)} // Add onClick handler
          >
            <div className='card2 rounded-lg border-richblack-700 border-2 '>
            <div className=" flex space-x-2  relative ml-3">
              {group.image
                .filter(imgSrc => imgSrc) // Filter out undefined or empty URLs
                .map((imgSrc, index) => (
                  <img
                    key={index}
                    src={imgSrc}
                    alt={`${group.Name} image ${index + 1}`}
                    className="w-8 h-8 rounded-full absolute"
                    style={{ left: `${index * 10}px` }} // Adjust the value to control overlap
                  />
                ))}
            </div>
            <h3 className="text-lg font-semibold mx-20 ">{group.Name}</h3>
            </div>
            
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyGroupsComponent;