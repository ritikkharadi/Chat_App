import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RiEditBoxLine } from "react-icons/ri"
import { formattedDate } from "../Utils/dateFormator"
import { setUser, setLoading } from "../slices/profileSlice"
import {getUserDetails} from "../services/operation/profileApi"
const Profile = () => { 
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
          setUser(storedUser);
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (user && !imageLoaded) {
      const img = new Image();
      img.src = user.image;
      img.onload = () => {
        setImageLoaded(true);
      };
    }
  }, [user, imageLoaded]);
  if (loading) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center">
        <div className="custom-loader"></div>
      </div>
    )
  }

 
  return (
    <div className="mx-auto h-full  max-w-[1200px] py-10 bg-richblack-900 rounded-sm p-6">
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 mb-4">
          {!imageLoaded && (
            <div className="w-full h-full bg-gray-300 rounded-full" />
          )}
          <img
            src={user?.image || `https://api.dicebear.com/5.x/initials/svg?seed=${user?.firstName}+${user?.lastName}`}
            alt={`profile-${user?.firstName}`}
            className={`w-full h-full rounded-full my-3  border-white border-4 object-cover ${imageLoaded ? '' : 'hidden'}`}
            onLoad={() => setImageLoaded(true)}
            loading="eager" // Disable lazy loading
          />
        </div>
        <h2 className="text-4xl font-semibold text-white">{user?.firstName + " " + user?.lastName}</h2>
        <p className="text-white font-normal text-lg">{user?.email}</p>
      
     
        <div className="flex justify-between items-center mb-4 mt-14">
          <p className="text-xl font-semibold text-white">Personal Details</p>
        </div>
      
          <div className="flex flex-col  gap-y-5">
            <div>
              <p className="mb-2 text-md font-semibold text-white">Username</p>
              <p className="text-md text-white">{user?.userName}</p>
            </div>
           
            <div>
              <p className="mb-2 text-md font-semibold text-white">Bio</p>
              <p className="text-md text-white">{user?.bio || "Bio not provided"}</p>
            </div>
            <div>
              <p className="mb-2 text-md font-semibold text-white">Joined on</p>
              <p className="text-md text-white">{formattedDate(user?.createdAt)}</p>
            </div>
          </div>
          </div>
         
        
      
    </div>
  );
}

export default Profile
