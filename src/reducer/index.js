import { combineReducers } from "redux";

 import authReducer from "../slices/authSlice"
 import other from "../slices/other";
 import profileReducer from "../slices/profileSlice"
 import chatReducer from "../slices/chatSlice"
// import courseReducer from '../slices/courseSlice'
// import viewCourseReducer from '../slices/viewCourseSlice'
const rootReducer = combineReducers({
   auth:authReducer,
   other:other,
  chat:chatReducer,
   profile:profileReducer,
  //   course:courseReducer,
  // viewCourse:viewCourseReducer,
})

export default rootReducer