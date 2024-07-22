import React, { Suspense, useState, useEffect } from 'react';
import { IoSearch } from "react-icons/io5";
import { FaPlus } from "react-icons/fa6";
import { RiTeamFill } from "react-icons/ri";
import { FaBell } from "react-icons/fa6";
import { MdLogout } from "react-icons/md";
import { Link } from 'react-router-dom';
import { RxHamburgerMenu } from "react-icons/rx";
import {logout} from "../../services/operation/authAPI";
import { useDispatch } from "react-redux"
import {  useNavigate } from "react-router-dom"
import ConfirmationModal from '../../Utils/confirmationModal';
import{setMobileScreen,isMobileScreen} from "../../slices/other"
// Lazy load components
const Search = React.lazy(() => import('../core/Navbar/Search'));
const Notification = React.lazy(() => import('../core/Navbar/Notification'));
const AddNewGroup = React.lazy(() => import('../core/Navbar/AddNewGroup'));

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 720);
  const [isSearch, setIsSearch] = useState(false);
  const [isNotification, setIsNotification] = useState(false);
  const [isNewGroup, setIsNewGroup] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 720);
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const searchHandler = () => {
    setIsSearch(prev => !prev);
  };

  const addHandler = () => {
    console.log("Add button clicked");
  };

  const manageHandler = () => {
    setIsNewGroup(prev => !prev);
  };

  const notificationHandler = () => {
    setIsNotification(prev => !prev);
  };

  const closeNotificationHandler = () => {
    setIsNotification(false);
  };

  const logoutHandler = () => {
    setIsModalOpen(true);
  };

  const menuButtonHandler = () => {
    dispatch(setMobileScreen(true));
    console.log('menu');
  };

  const openSearchModal = () => {
    setIsSearchModalOpen(true);
  };

  const closeSearchModal = () => {
    setIsSearchModalOpen(false);
  };

  const modalData = {
    text1: "Confirmation",
    text2: "Do you really want to logout from ChatUp?",
    btn1Text: "Cancel",
    btn2Text: "Yes",
    btn1Handler: () => setIsModalOpen(false),
    btn2Handler: () => {
      dispatch(logout(navigate));
      setIsModalOpen(false);
    }
  };

  return (
    <div>
      <div className='flex h-14 items-center justify-center border-b-[1px] bg-specialBlue-100 border-b-richblack-700'>
        <div className='flex w-11/12 max-w-maxContent items-center justify-between border-b-richblack-700'>
          <Link to="/">
            <p className='text-pure-greys-25'>ChatUp</p>
          </Link>
          <nav className='mx-6'>
            <ul className='hidden md:flex gap-x-10 text-richblack-25'>
              <button onClick={openSearchModal}><IoSearch/></button>
              <button onClick={addHandler}><FaPlus /></button>
              <button onClick={manageHandler}><RiTeamFill /></button>
              <button onClick={notificationHandler}><FaBell /></button>
              <button onClick={logoutHandler}><MdLogout /></button>
            </ul>
            {isMobile && (
              <button className="block md:hidden" onClick={menuButtonHandler}>
                <RxHamburgerMenu className='text-white' />
              </button>
            )}
          </nav>
        </div>
      </div>
      {isSearch && (
        <Suspense fallback={<div>Loading...</div>}>
          <Search />
        </Suspense>
      )}
      {isNotification && (
        <div className="fixed inset-0 z-[1000] grid place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm" onClick={closeNotificationHandler}>
         <Suspense fallback={<div>Loading...</div>}>
          <Notification />
        </Suspense>
        </div>
      )}
      {isNewGroup && (
        <Suspense fallback={<div>Loading...</div>}>
          <AddNewGroup />
        </Suspense>
      )}
      {isModalOpen && <ConfirmationModal modalData={modalData} />}
      <Suspense fallback={<div>Loading...</div>}>
        <Search isOpen={isSearchModalOpen} onClose={closeSearchModal} />
      </Suspense>
    </div>
  );
};

export default Navbar;