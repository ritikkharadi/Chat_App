// import axios from "axios"

// export const axiosInstance = axios.create({});

// export const apiConnector = (method, url, bodyData, headers, params) => {
//     return axiosInstance({
//         method:`${method}`,
//         url:`${url}`,
//         data: bodyData ? bodyData : null,
//         headers: headers ? headers: null,
//         params: params ? params : null,
//     });
// }


// apiConnector.js
import axios from "axios";
import store from '../index'; // Import the store

export const axiosInstance = axios.create({});

export const apiConnector = (method, url, bodyData, headers, params) => {
    const state = store.getState(); // Get the current state
    const token = state.auth.token; // Retrieve the token from the state

    const authHeader = token ? { 'Authorization': `Bearer ${token}` } : {};

    return axiosInstance({
        method: `${method}`,
        url: `${url}`,
        data: bodyData ? bodyData : null,
        headers: headers ? { ...headers, ...authHeader } : authHeader,
        params: params ? params : null,
    });
};

