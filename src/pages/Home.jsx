import React from 'react'
import Chatlist from './chatlist'
import Chat from './Chat'
import Profile from './profile'
import { useDispatch } from 'react-redux'
import { useState,useEffect } from 'react'
import { useSelector } from 'react-redux'
import { setMobileScreen } from '../slices/other';
import CustomDrawer from '../Utils/customDrower';

const Home = () => {
  const dispatch = useDispatch();
  const isMobileScreen = useSelector((state) => state.other.isMobileScreen);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 720);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 720;
      setIsMobile(isMobile);
      if (!isMobile) {
        dispatch(setMobileScreen(false));
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [dispatch]);

  const closeDrawer = () => {
    dispatch(setMobileScreen(false));
  };

  return (
    <div style={{ display: 'flex', width: '100%' }}>
      {!isMobile && (
        <div style={{ flex: 1 }} >
          <Chatlist />
        </div>
      )}

      <div style={{ flex: 2 }}  >
        <Chat />
      </div>

      {!isMobile && (
        <div style={{ flex: 1 }} className=' '>
          <Profile />
        </div>
      )}

      <CustomDrawer isOpen={isMobileScreen} onClose={closeDrawer}>
        <Chatlist />
      </CustomDrawer>
    </div>
  );
};

export default Home;