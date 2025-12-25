import axios from 'axios';
import {env} from '../config';
import {store} from '../redux/store';

// const baseURL = 'https://cindel-api.opash.in';
// const baseURL = env.API_URL;
const baseURL = 'https://ring-api.freedom.buzz';
// const baseURL = 'http://192.168.1.20:3000';

axios.defaults.baseURL = baseURL;

export const axiosInstance = axios.interceptors.request.use(function (request) {
  try {
    const state = store.getState();
    const token = state.auth.token;

    if (token) {
      request.headers.Authorization = token;
    }

    return request;
  } catch (err) {
    console.log('error in interceptor', err);
  }
});

axios.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    console.log('====================================');
    console.log(response.status,response.data);
    console.log('====================================');
    return response.data; // Return response data to the calling code
  },
  function (error) {
    // Any status codes that fall outside the range of 2xx cause this function to trigger
    // Do something with response error
    const {response} = error;

    if (!response) {
      // Network error occurred
      console.error('Network error:', error);
      // You may want to dispatch an action or handle the error in some way
      return Promise.reject(error);
    }

    // console.log(response);

    // if (response.status === 401) {
    //   console.log('---401---', response?.error);
    //   store.dispatch(logout());
    // }

    // Other error handling logic goes here
    return Promise.reject(error);
  },
);

export default axios;
