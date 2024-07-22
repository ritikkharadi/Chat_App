import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isNewGroup: false,
    isAddMembers: false,
    isNotification: false,
    isMobileScreen: false,
    isSearch: false,
    isFileMenu: false,
    isDeleteMenu: false,
    uploadingLoader: false,
    selectedDeleteChat: {
        chatId: "",
        groupChat: false,
    },
};

const otherSlice = createSlice({
    name: "other",
    initialState: initialState,

    reducers: {
        setNewGroup(state, action) {
            state.isNewGroup = action.payload;
        },
        setAddMembers(state, action) {
            state.isAddMembers = action.payload;
        },
        setNotification(state, action) {
            state.isNotification = action.payload;
        },
        setMobileScreen(state, action) {
            state.isMobileScreen = action.payload;
        },
        setSearch(state, action) {
            state.isSearch = action.payload;
        },
        setIsFileMenu(state, action) {
            state.isFileMenu = action.payload;
        },
        setDeleteMenu(state, action) {
            state.isDeleteMenu = action.payload;
        },
        setUploadingLoader(state, action) {
            state.uploadingLoader = action.payload;
        },
        setSelectedDeleteChat(state, action) {
            state.selectedDeleteChat = action.payload;
        },
    },
});

export const {
    setNewGroup,
    setAddMembers,
    setNotification,
    setMobileScreen,
    setSearch,
    setIsFileMenu,
    setDeleteMenu,
    setUploadingLoader,
    setSelectedDeleteChat,
} = otherSlice.actions;

export default otherSlice.reducer;
