import { useState } from "react"
import { toast } from "react-hot-toast"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"

 import { sendOtp } from "../services/operation/authAPI"
 import { setSignupData } from "../slices/authSlice"

// import Tab from "./common/Tab"

function Signup() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // student or instructor
  

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
   
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { firstName, lastName, email, password, confirmPassword } = formData

  // Handle input fields, when some value changes
  const handleOnChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }))
  }

  // Handle Form Submission
  const handleOnSubmit = (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Passwords Do Not Match")
      return
    }
    const signupData = {
      ...formData,
     
    }

    // Setting signup data to state
    // To be used after otp verification
   dispatch(setSignupData(signupData))
   
    // Send OTP to user for verification
   dispatch(sendOtp(formData.email, navigate))

    // Reset
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      
    })
   
  }


  return (
    <div className=" flex flex-col items-center ">
   
   
      {/* Form */}
      <form onSubmit={handleOnSubmit} className="flex w-full mt-40 max-w-md flex-col gap-y-4 bg-white p-6 rounded-lg shadow-md">
        <div className="flex gap-x-4">
          <label className="w-full">
            <p className="mb-1 text-sm leading-[1.375rem] text-gray-700">
              First Name <sup className="text-red-500">*</sup>
            </p>
            <input
              required
              type="text"
              name="firstName"
              value={firstName}
              onChange={handleOnChange}
              placeholder="Enter first name"
              className="w-full rounded-lg bg-gray-200 p-3 text-gray-800"
            />
          </label>
          <label className="w-full">
            <p className="mb-1 text-sm leading-[1.375rem] text-gray-700">
              Last Name <sup className="text-red-500">*</sup>
            </p>
            <input
              required
              type="text"
              name="lastName"
              value={lastName}
              onChange={handleOnChange}
              placeholder="Enter last name"
              className="w-full rounded-lg bg-gray-200 p-3 text-gray-800"
            />
          </label>
        </div>
      
        <label className="w-full">
          <p className="mb-1 text-sm leading-[1.375rem] text-gray-700">
            Email Address <sup className="text-red-500">*</sup>
          </p>
          <input
            required
            type="email"
            name="email"
            value={email}
            onChange={handleOnChange}
            placeholder="Enter email address"
            className="w-full rounded-lg bg-gray-200 p-3 text-gray-800"
          />
        </label>
        <div className="flex gap-x-4">
          <label className="relative w-full">
            <p className="mb-1 text-sm leading-[1.375rem] text-gray-700">
              Create Password <sup className="text-red-500">*</sup>
            </p>
            <input
              required
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={handleOnChange}
              placeholder="Enter Password"
              className="w-full rounded-lg bg-gray-200 p-3 text-gray-800 pr-10"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600"
            >
              {showPassword ? (
                <AiOutlineEyeInvisible fontSize={24} />
              ) : (
                <AiOutlineEye fontSize={24} />
              )}
            </span>
          </label>
          <label className="relative w-full">
            <p className="mb-1 text-sm leading-[1.375rem] text-gray-700">
              Confirm Password <sup className="text-red-500">*</sup>
            </p>
            <input
              required
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleOnChange}
              placeholder="Confirm Password"
              className="w-full rounded-lg bg-gray-200 p-3 text-gray-800 pr-10"
            />
            <span
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600"
            >
              {showConfirmPassword ? (
                <AiOutlineEyeInvisible fontSize={24} />
              ) : (
                <AiOutlineEye fontSize={24} />
              )}
            </span>
          </label>
        </div>
        <button
          type="submit"
          className="mt-6 rounded-lg bg-yellow-500 py-3 px-4 font-medium text-white hover:bg-yellow-600"
        >
          Create Account
        </button>
      </form>
    </div>
  )
}

export default Signup