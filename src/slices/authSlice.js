import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    signupdata: null,
    token: localStorage.getItem("token") ? JSON.parse(localStorage.getItem("token")) : null,
    loading: false,
    isUser: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState: initialState,
    reducers: {
        setSignupData: (state, value) => {
            state.signupdata = value.payload;
        },
        setLoading: (state, value) => {
            state.loading = value.payload;
        },
        setToken: (state, value) => {
            state.token = value.payload;
            localStorage.setItem("token", JSON.stringify(value.payload)); // Ensure token is saved to localStorage
        },
        setIsUser: (state, value) => {
            state.isUser = value.payload;
        }
    }
});

export const { setSignupData, setLoading, setToken, setIsUser } = authSlice.actions;

export default authSlice.reducer;