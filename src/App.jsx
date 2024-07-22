import React, { Suspense, useState } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import ProtectedRoute from './component/core/Auth/PrivateRoute';
import { SocketProvider } from './socket';
import Navbar from './component/common/Navbar';
import "./App.css";
import { useSelector } from 'react-redux';
import { setIsUser,setToken } from './slices/authSlice';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from './Utils/errorBoundary';
import withDynamicImport from './Utils/withDynamicInsert';

// const Login = React.lazy(() => import('./pages/login'));
// const Signup = React.lazy(() => import('./pages/Signup'));
// const Home = React.lazy(() => import('./pages/Home'));
// const Chat = React.lazy(() => import('./pages/Chat'));
// const EmailVerify = React.lazy(() => import('./pages/verifyEmail'));
const Login = React.lazy(() => import('./pages/login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const Home = React.lazy(() => import('./pages/Home'));
const Chat = React.lazy(() => import('./pages/Chat'));
const EmailVerify = React.lazy(() => import('./pages/verifyEmail'));
 // Simulating user authentication status

 function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isUser, token } = useSelector((state) => state.auth);

  useEffect(() => {
    const localToken = localStorage.getItem('token');
    console.log("user_token", localToken);

    if (localToken) {
      // If token exists in local storage, user is authenticated
      dispatch(setToken(JSON.parse(localToken)));
      dispatch(setIsUser(true));
      console.log("tokencheck", localToken);
      console.log("isUser", isUser);
    } else {
      // No token found, user is not authenticated
      dispatch(setIsUser(false));
    }
  }, [dispatch, token, isUser]);

  useEffect(() => {
    if (isUser) {
      // navigate('/home');
      console.log("Navigating to /home");
    }
  }, [isUser, navigate]);

  return (
    <div className=''>
      {isUser && <Navbar />}
      <Suspense fallback={<div>...Loading</div>}>
        <Routes>
          <Route path="/" element={isUser ? <Navigate to="/home" replace /> : <Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<EmailVerify />} />
          <Route element= {<SocketProvider> <ProtectedRoute user={isUser} /></SocketProvider> }>
        <Route path="/home" element={<Home />} />
          <Route path="/home/:chatId" element={<Home />} />
            {/* <Route path="/chat/:chatId" element={<Chat />} /> */}
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;