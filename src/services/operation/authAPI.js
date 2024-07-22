import {toast} from "react-hot-toast"
import { setIsUser, setLoading, setToken } from '../../slices/authSlice'
//import { resetCart } from "../../slices/cartSlice " 
import {setUser}  from "../../slices/profileSlice"
import { apiConnector } from "../apiconnectors"
import { userEndpoints } from "../apis"


const {

 
    LOGIN_API,
    SIGNUP_API,
    SEND_OTP_API,
    LOGOUT_API,
    SEND_FRIEND_REQUEST_API,
    HANDLE_FRIEND_REQUEST_API,
    SEARCH_USER_API,
    GET_NOTIFICATION_API
 
  
  }  = userEndpoints

  export function login(email, password, navigate) {
    return async (dispatch) => {
      const toastId = toast.loading("Loading..."); // Display loading toast
  
      try {
        const response = await apiConnector("POST", LOGIN_API, {
          email,
          password,
        });
  
        if (response.data.success) {
          // Login successful
          toast.dismiss(toastId); // Dismiss loading toast
          toast.success("Login Successfully"); // Display success toast
         
          dispatch(setToken(response.data.token))
          //dispatch(setIsUser(true));
          localStorage.setItem("token", JSON.stringify(response.data.token));
          localStorage.setItem("user", JSON.stringify(response.data.user));
         console.log("token",response.data.token);
         // navigate("/dashboard/my-profile");
        } else {
          // Login failed
          throw new Error(response.data.message); // Throw error to be caught in catch block
        }
      } catch (error) {
        // Handle login error
        console.error("LOGIN API ERROR:", error);
        toast.dismiss(toastId); // Dismiss loading toast
        toast.error("Could Not Login"); // Display error toast
      }
    };
  }


  // signup 
  export function signUp(
  
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    otp,
   
    navigate
  ){
    return async (dispatch) => {
       const toastId = toast.loading("Loading...")
       dispatch(setLoading(true));
  
       try {
        const response = await apiConnector("POST", SIGNUP_API, {
          firstName,
          lastName,
          email,
          password,
          confirmPassword,
          otp,
          
        })
  
        console.log("SIGNUP_API RESPONSE............", response)
  
        console.log(response.data.success)
   
        if(!response.data.success){
          throw new Error(response.data.message)
        }
  
        toast.success("Signup successful")
        navigate("/login")
       } catch (error) {
        console.log("SIGNUP_API ERROR............", error)
        toast.error("Could Not Sign up user")
       }
       dispatch(setLoading(false));
       toast.dismiss(toastId);
    }
  }
  //sendotp 
  export function sendOtp(email, navigate){
    return async (dispatch) => {
       const toastId = toast.loading("Loading...")
       dispatch(setLoading(true));
  
       try {
        const response = await apiConnector("POST", SEND_OTP_API, {
          email,
          checkUserPresent: true,
        })
  
        console.log("SENDOTP API RESPONSE............", response)
  
        console.log(response.data.success)
  
        if(!response.data.success){
          throw new Error(response.data.message)
        }
  
        toast.success("OTP Sent Successfully")
        navigate("/verify-email")
       } catch (error) {
        console.log("SENDOTP API ERROR............", error)
        toast.error("Could Not Send OTP")
       }
       dispatch(setLoading(false));
       toast.dismiss(toastId);
    }
  }

  // export function getPasswordResetToken(email, setemailsent){
  //   return async(dispatch) =>{
  //    // const toastId = toast.loading("Loading...")
  //     dispatch(setLoading(true));
  
  //     try {
  //      const response = await apiConnector("POST", RESETPASSTOKEN_API, {email});
  //      console.log("RESETPASSTOKEN_API RESPONSE............", response)
  
  //       console.log(response.data.success)
  
  //       if(!response.data.success){
  //         throw new Error(response.data.message)
  //       }
      
  //       toast.success("Mail Sent successful")
  //       setemailsent(true);
  //     } catch (error) {
  //       console.log("RESETPASSTOKEN_API ERROR............", error)
  //       toast.error("Could Not Send Mail")
  //     }
  //     dispatch(setLoading(false));
  //      //toast.dismiss(toastId);
  //   }
  // }

  // export function resetPassword(password, confirmPassword, token,navigate){
  //   console.log("Received token:", token);
  //   return async(dispatch) =>{
  //    // const toastId = toast.loading("Loading...")
  //     dispatch(setLoading(true));
  
  //     try {
  //      const response = await apiConnector("POST", RESETPASSWORD_API, {password, confirmPassword, token, navigate});
  //      console.log("RESETPASSWORD_API RESPONSE............", response)
  
  //       console.log(response.data.success)
  
  //       if(!response.data.success){
  //         throw new Error(response.data.message)
  //       }
      
  //       toast.success("Password have been reset successfully")
  //       navigate('/login')
  //     } catch (error) {
  //       console.log("RESETPASSword_API ERROR............", error)
  //       toast.error("Could Not reset password")
  //     }
  //     dispatch(setLoading(false));
  //      //toast.dismiss(toastId);
  //   }
  // }

  export function logout(navigate) {
    return (dispatch)=>{
      dispatch(setToken(null));
      dispatch(setUser(null));
      dispatch(setIsUser(false));
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      toast.success("Logged Out")
      navigate("/")
    }
  }