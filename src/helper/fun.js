// import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
// import {PermissionsAndroid, Platform} from 'react-native';
// import dayjs from 'dayjs';

// export const handleImagePicker = {
//   requestCameraPermission: async () => {
//     try {
//       if (Platform.OS === 'android') {
//         var granted = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.CAMERA,
//           {
//             title: 'Camera Permission',
//             message: 'App needs access to your camera',
//             buttonNeutral: 'Ask Me Later',
//             buttonNegative: 'Cancel',
//             buttonPositive: 'OK',
//           },
//         );
//       }

//       if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//         console.log('Camera permission granted');
//       } else {
//         console.log('Camera permission denied');
//       }

//       return granted === PermissionsAndroid.RESULTS.GRANTED;
//     } catch (err) {
//       console.warn(err);
//     }
//   },

//   handleLaunchCamera: async setPhoto => {
//     if (await handleImagePicker.requestCameraPermission()) {
//       launchCamera({mediaType: 'photo'}, response => {
//         handleImagePicker.handleImagePickerResponse(response, setPhoto);
//       });
//     } else {
//       return false;
//     }
//   },

//   handleLaunchImageLibrary: setPhoto => {
//     launchImageLibrary({mediaType: 'photo'}, response => {
//       handleImagePicker.handleImagePickerResponse(response, setPhoto);
//     });
//   },

//   handleImagePickerResponse: (response, setPhoto) => {
//     if (response.didCancel) {
//       console.log('User cancelled image picker');
//     } else if (response.error) {
//       console.log('ImagePicker Error: ', response.error);
//     } else if (response.customButton) {
//       console.log('User tapped custom button: ', response.customButton);
//     } else {
//       if (response) {
//         setPhoto(response.assets[0]);
//       }
//     }
//   },
// };

// export function convertISOTOCustomDate(date) {
//   const formattedDate = new Intl.DateTimeFormat('en-US', {
//     day: '2-digit',
//     month: 'short',
//     year: '2-digit',
//     // timeZone: 'UTC',
//   }).format(date);

//   return formattedDate;
// }

// export function formatDate(date, format = 'DD-MM-YYYY') {
//   if (!date) {
//     return '';
//   }

//   return dayjs(date).format(format).toString();
// }
