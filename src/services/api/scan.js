// Old code:
// import {axiosInterceptor} from '../index';
// import axios from 'axios';

// const config = {
//   headers: {
//     'Content-Type': 'application/json',
//   },
// };

// axios.interceptors.request.eject(axiosInterceptor);

// const scanAPI = {
//   // Validate token User api
//   validateToken(data) {
//     return axios.post(`/api/v1/customers/verify-token`, data, config);
//   },
  

//   deleteScannedUser(data) {
//     return axios.delete(`/api/v1/customers/delete/${data.scanId}`, config);
//   },
// };

// export default scanAPI;

// New code:
import {axiosInterceptor} from '../index';
import axios from 'axios';
const config = {
  headers: {
    'Content-Type': 'application/json',
  },
};
axios.interceptors.request.eject(axiosInterceptor);
const scanAPI = {
  // Validate token User api
  validateToken(data) {
    // Extract domain from the payload
    const { domain, token, deviceId } = data;
    // Clean domain (remove www. if present)
    const cleanDomain = domain?.replace('www.', '').trim();
    // Construct the correct API URL based on domain
    const apiUrl = `https://ring-api.${cleanDomain}/api/v1/customers/verify-token`;
    console.log(`:mag: [SCAN API] Calling verify-token for domain: ${cleanDomain}`);
    console.log(`:mag: [SCAN API] API URL: ${apiUrl}`);
    // Use axios with the full URL instead of relative path
    return axios.post(apiUrl, data, config);
  },
  deleteScannedUser(data) {
    // For delete, we might also need to use domain, but let's check if it's needed
    // If delete also needs domain-based routing, update it similarly
    return axios.delete(`/api/v1/customers/delete/${data.scanId}`, config);
  },
};
export default scanAPI;