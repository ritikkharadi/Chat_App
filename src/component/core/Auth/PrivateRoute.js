import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useSocket } from '../../../socket';  // Adjust the import path as necessary

const ProtectedRoute = ({ user }) => {
  const socket = useSocket();
  const userId = useSelector((state) => state.profile.user?._id);

  useEffect(() => {
    if (socket && userId) {
      socket.emit("REGISTER_USER", userId);
    }
  }, [socket, userId]);

  if (!user) {
    // If user is not authenticated, redirect to login
    return <Navigate to="/" replace />;
  }

  // If user is authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
