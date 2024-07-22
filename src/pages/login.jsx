
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux"
 import { login } from "../services/operation/authAPI";
const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
      email: "",
      password: "",
  });

  const { email, password } = formData

  function changeHandler(event) {
      setFormData((prev) => ({
          ...prev,
          [event.target.name]: event.target.value,
      }));
  }

  
  function submitHandler(event) {
      event.preventDefault();
       toast.success("Login Success");
     dispatch(login(email, password, navigate))
  
      console.log(formData)
    //  setIsLoggedIn(true);
    //  navigate("/dashboard");
  }

  return (

<div className="flex flex-col items-center">
    <form onSubmit={submitHandler} className="flex flex-col mt-40 w-80  h-[400px] gap-y-4  bg-white p-6 rounded-lg shadow-md">
      <label htmlFor="email" className="w-full">
        <p className="text-sm mb-1 text-black leading-[1.375rem]">
          Email Address
          <sup className="text-pink-500">*</sup>
        </p>
        <input
          required
          type="text"
          name="email"
          value={email}
          onChange={changeHandler}
          placeholder="Enter your email address"
          className="w-full rounded-lg bg-gray-200 p-3 text-gray-800"
        />
      </label>

      <label htmlFor="password" className="relative w-full">
        <p className="text-sm text-black mb-1 leading-[1.375rem]">
          Password
          <sup className="text-pink-500">*</sup>
        </p>
        <input
          type={showPassword ? "text" : "password"}
          required
          value={formData.password}
          placeholder="Enter Password"
          onChange={changeHandler}
          name="password"
          className="w-full rounded-lg bg-gray-200 p-3 text-gray-800"
        />
        <span
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[38px] cursor-pointer"
        >
          {showPassword ? (
            <AiOutlineEyeInvisible fontSize={24} fill="#AFB2BF" />
          ) : (
            <AiOutlineEye fontSize={24} fill="#AFB2BF" />
          )}
        </span>
        <Link to="forgot-password">
          <p className="text-xs mt-1 text-blue-500 max-w-max ml-auto">
            Forgot Password
          </p>
        </Link>
      </label>

      <button className="mt-6 rounded-lg bg-yellow-500 py-3 px-4 font-medium text-white hover:bg-yellow-600">
        Log in
      </button>
      <div className="text-center">
  <p>or</p>
  <Link to="/signup">
    <p className="text-xs mt-1 text-blue-500 max-w-max mx-24 px-5 my-2">
      SignUp
    </p>
  </Link>
</div>


    </form>
    </div>
  )
}

export default Login
