import {createAsyncThunk} from '@reduxjs/toolkit';
import scanAPI from '../../../services/api/scan';

// export const validateTokenThunk = createAsyncThunk(
//   'validateToken',
//   async (data, {rejectWithValue}) => {
//     try {
//       const response = await scanAPI.validateToken(data);
//       console.log("jjjjjjjjjjj",response)
//       return response;
//     } catch (error) {
//       console.log(error);
//       if (error.response && error.response.data.message) {
//         return rejectWithValue(error.response.data.message);
//       } else {
//         return rejectWithValue(error.message);
//       }
//     }
//   },
// );

export const validateTokenThunk = createAsyncThunk(
  'scanner/validateToken',
  async (payload, { rejectWithValue }) => {
    try {
      const { domain, token, deviceId } = payload;
      // Extract clean domain (remove www. if present)
      const cleanDomain = domain?.replace('www.', '').trim();
      // Use the domain to construct the correct API URL
      const apiUrl = `https://ring-api.${cleanDomain}/api/v1/customers/verify-token`;
      console.log(`:mag: [VALIDATE TOKEN] Calling API: ${apiUrl} for domain: ${cleanDomain}`);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: cleanDomain,
          token,
          deviceId,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        console.error(`:x: [VALIDATE TOKEN] API Error:`, data);
        return rejectWithValue(data);
      }
      console.log(`:white_check_mark: [VALIDATE TOKEN] Success for domain: ${cleanDomain}`);
      return data;
    } catch (error) {
      console.error(':x: [VALIDATE TOKEN] Error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteUserThunk = createAsyncThunk(
  'deleteUser',
  async (data, {rejectWithValue}) => {
    try {
      const response = await scanAPI.deleteScannedUser(data);
      return response;
    } catch (error) {
      console.log(error);
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  },
);
