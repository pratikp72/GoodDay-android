import React, { useEffect, useRef, useState } from 'react';
import { Text, View, StyleSheet, StatusBar } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import DeviceInfo from 'react-native-device-info';
import { useDispatch, useSelector } from 'react-redux';
import { addScannerData } from '../../redux/store/scanner/scannerSlice';
import { validateTokenThunk } from '../../redux/store/scanner/scannerAction';
import { useToastMessage } from '../../hooks/useToastMessage';
import GlobalString from '../../constants/string';
import style from './ScannerScreen.styles';
import AppLoader from '../../components/AppLoader';
import { ArrowLeftIcon, CloseIcon, Icon, useStyled } from '@gluestack-ui/themed';
import { Button } from '@gluestack-ui/themed';
import { ButtonText } from '@gluestack-ui/themed';
import { moderateScale, verticalScale } from '../../constants/matrics';
import messaging from '@react-native-firebase/messaging';
import * as ImagePicker from 'react-native-image-picker';
import RNQRGenerator from 'rn-qr-generator';
import { initSocket } from 'index';

export default function ScannerScreen({ navigation }) {
  const scanner = useSelector(state => state?.scanner?.data) || [];
  console.log(JSON.stringify(scanner) + 'log scanner');
  const { hasPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const [isActive, setIsActive] = useState(true);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [scanData, setScanData] = useState(null);
  const dispatch = useDispatch();
  const { showToast } = useToastMessage();
  const styled = useStyled();
  const styles = style(styled.config.tokens);
  const [isLoading, setIsLoading] = useState(false);
  const camera = useRef(null);

  const resetData = () => {
    setScanData(null);
    setIsActive(true);
  };




  const gotoHome = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();

      //      console.log("dataaaaa")
      //  handleValidateToken('https://freedom.buzz/settings/edit-profile/68339?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjo2ODMzOSwidXNlcm5hbWUiOiJpbWFycGl0emFsYSIsImFjdGl2ZSI6IlkifSwiaWF0IjoxNzUyNTcyNDkxfQ.N8RLyElVbw4ZmlB4Q__ayL5X4pr7swkn_GY9Ad1ZbgE')
      //   }
    }
  };

  // Old:
  // const handleValidateToken = async data => {
  //   try {
  //     setIsLoading(true);
  //     // Extract the domain and token
  //     const domainRegex =
  //       /(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)/g;
  //     const domainMatch = data?.match(domainRegex);
  //     const domain = domainMatch ? domainMatch[0] : null;
  //     const token = data?.split('?token=')[1];

  //     if (!domain || !token) {
  //       showToast({ message: 'Invalid QR code' });
  //       setIsLoading(false);
  //       resetData();
  //       gotoHome();
  //       return;
  //     }

  //     const cleanedDomain = domain.replace('https://', '').replace('dev.', '');

  //     const payload = {
  //       domain: cleanedDomain,
  //       token,
  //       deviceId: DeviceInfo.getDeviceId(),
  //     };
  //     console.log('validateToken payload:', payload);

  //     const response = await dispatch(validateTokenThunk(payload)).unwrap();
  //     console.log('REsponse ', JSON.stringify(response));

  //     setIsLoading(false);
  //     if (response.success) {
  //       console.log('KJdfkjaslfdjljsadlfjlasjdlfjlsadjflksjadlfjsldkjfsdfk');
  //       console.log(scanner);

  //       let isExist = false;
  //       if (Array.isArray(scanner)) {
  //         isExist = scanner?.find(item => item?.Id === response?.data?.Id);
  //       }
  //       if (!isExist) {
  //         await dispatch(addScannerData(response.data));
  //         initSocket();
  //         setSuccessModalVisible(true);

  //       } else {
  //         resetData();
  //         gotoHome();
  //         showToast({ message: 'User is already added !!' });
  //       }
  //     } else {
  //       resetData();
  //       gotoHome();
  //       showToast({ message: response.message });
  //     }
  //   } catch (error) {
  //     showToast({ message: error?.message || error.toString() });
  //     console.log(error);
  //     setIsLoading(false);
  //     resetData();
  //     gotoHome();
  //   }
  // };

// New:
  const handleValidateToken = async data => {
    try {
      setIsLoading(true);
      // Extract the domain and token from QR code URL
      // QR code format: https://ee2e.app/settings/edit-profile/32?token=...
      let domain = null;
      let token = null;
      try {
        // Try to parse as URL first (more reliable)
        const url = new URL(data);
        domain = url.hostname.replace('www.', '').replace('dev.', '');
        token = url.searchParams.get('token');
      } catch (e) {
        // Fallback to regex if URL parsing fails
        const domainRegex = /(?:https?:\/\/)?(?:www\.)?([^:\/?\n]+)/g;
        const domainMatch = data?.match(domainRegex);
        domain = domainMatch ? domainMatch[0].replace('https://', '').replace('http://', '').replace('www.', '').replace('dev.', '') : null;
        token = data?.split('?token=')[1]?.split('&')[0];
      }
      if (!domain || !token) {
        console.error(':x: [SCANNER] Invalid QR code - missing domain or token', { domain, hasToken: !!token });
        showToast({ message: 'Invalid QR code' });
        setIsLoading(false);
        resetData();
        gotoHome();
        return;
      }
      // Clean domain (remove trailing slashes, www, dev)
      const cleanedDomain = domain.trim().replace(/\/$/, '');
      const payload = {
        domain: cleanedDomain,
        token,
        deviceId: DeviceInfo.getDeviceId(),
      };
      console.log(':mag: [SCANNER] validateToken payload:', payload);
      // Call verify-token API
      const response = await dispatch(validateTokenThunk(payload)).unwrap();
      console.log(':white_check_mark: [SCANNER] verify-token response:', JSON.stringify(response));
      setIsLoading(false);
      if (response.success) {
        console.log(':white_check_mark: [SCANNER] QR scan successful');
        // Check if user already exists
        let isExist = false;
        if (Array.isArray(scanner)) {
          isExist = scanner?.find(item => item?.Id === response?.data?.Id);
        }
        if (!isExist) {
          // Add user to scanner
          await dispatch(addScannerData(response.data));
          // Initialize socket connection
          initSocket();
          // :white_check_mark: CRITICAL: Register FCM token immediately after successful scan
          try {
            console.log(':iphone: [SCANNER] Getting FCM token for registration...');
            // Use messaging() function - make sure it's imported at the top
            const fcmToken = await messaging().getToken();
            if (fcmToken) {
              console.log(':iphone: [SCANNER] FCM token obtained, registering device...', {
                deviceId: DeviceInfo.getDeviceId(),
                domain: cleanedDomain,
                fcmTokenLength: fcmToken.length
              });
              const registerResponse = await fetch(
                `https://ring-api.${cleanedDomain}/api/v1/customers/register-device`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    deviceId: DeviceInfo.getDeviceId(),
                    fcmToken: fcmToken,
                  }),
                }
              );
              if (!registerResponse.ok) {
                const errorData = await registerResponse.json().catch(() => ({ message: 'Unknown error' }));
                console.error(':x: [SCANNER] register-device failed:', {
                  status: registerResponse.status,
                  error: errorData
                });
                // Don't block the flow if FCM registration fails - user can still use the app
              } else {
                const registerResult = await registerResponse.json();
                console.log(':white_check_mark: [SCANNER] FCM token registered successfully:', registerResult);
              }
            } else {
              console.warn(':warning: [SCANNER] No FCM token available to register');
              // Try again after a short delay (FCM token might not be ready yet)
              setTimeout(async () => {
                try {
                  const retryFcmToken = await messaging().getToken();
                  if (retryFcmToken) {
                    console.log(':iphone: [SCANNER] Retrying FCM registration...');
                    const retryResponse = await fetch(
                      `https://ring-api.${cleanedDomain}/api/v1/customers/register-device`,
                      {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          deviceId: DeviceInfo.getDeviceId(),
                          fcmToken: retryFcmToken,
                        }),
                      }
                    );
                    if (retryResponse.ok) {
                      const retryResult = await retryResponse.json();
                      console.log(':white_check_mark: [SCANNER] FCM token registered on retry:', retryResult);
                    }
                  }
                } catch (retryError) {
                  console.error(':x: [SCANNER] Retry FCM registration failed:', retryError);
                }
              }, 2000);
            }
          } catch (registerError) {
            console.error(':x: [SCANNER] Error registering FCM token:', registerError);
            // Don't block the flow if FCM registration fails - user can still use the app
            // The store subscription will try to register it later
          }
          // Show success modal
          setSuccessModalVisible(true);
        } else {
          // User already exists
          console.log(':information_source: [SCANNER] User already added');
          resetData();
          gotoHome();
          showToast({ message: 'User is already added !!' });
        }
      } else {
        // Verify token failed
        console.error(':x: [SCANNER] verify-token failed:', response.message);
        resetData();
        gotoHome();
        showToast({ message: response.message || 'Failed to verify token' });
      }
    } catch (error) {
      console.error(':x: [SCANNER] Error in handleValidateToken:', error);
      showToast({
        message: error?.message || error?.toString() || 'An error occurred while scanning QR code'
      });
      setIsLoading(false);
      resetData();
      gotoHome();
    }
  }

    const openPhoto = () => {
      console.log('ImagePicker');
      ImagePicker.launchImageLibrary({}, response => {
        try {
          console.log('Response = ', response);

          if (response.didCancel) {
            console.log('User cancelled image picker');
          } else if (response.error) {
            console.log('ImagePicker Error: ', response.error);
          } else if (response.customButton) {
            console.log('User tapped custom button: ', response.customButton);
          } else {
            var file = response?.assets?.[0];

            if (file?.uri) {
              var path = file?.path;
              if (!path) {
                path = file?.uri;
              }
              console.log(path);
              // QRreader(path)
              //   .then(data => {
              //     console.log(data);
              //   })
              //   .catch(err => {
              //     console.log(err);
              //   });

              // Detect QR code in image
              RNQRGenerator.detect({
                uri: path,
              })
                .then(response => {
                  const { values } = response; // Array of detected QR code values. Empty if nothing found.
                  console.log("shshhsh", response);
                  handleValidateToken(values[0]);
                })
                .catch(error =>
                  console.log('Cannot detect QR code in image', error),
                );
            }
          }
        } catch (error) {
          console.log(error);
        }
      });
    };

    useEffect(() => {

      if (!isActive && scanData && !isLoading) {
        handleValidateToken(scanData);
      } else {
        setIsActive(true);
      }
    }, [isActive, scanData]);
    useEffect(() => {


    }, [])

    const codeScanner = useCodeScanner({
      codeTypes: ['qr'],
      onCodeScanned: codes => {
        setIsActive(false);
        setScanData(codes?.[0]?.value);
      },
    });

    //   return (
    //     <>
    //       <AppLoader showModal={isLoading} />
    //       {hasPermission && (
    //         <View style={styles.scannerContainer}>
    //           <StatusBar barStyle={'light-content'} />
    //           <View style={styles.headerContainer}>
    //             <Icon
    //               as={ArrowLeftIcon}
    //               color={'white'}
    //               onPress={() => {
    //                 navigation.pop();
    //               }}
    //               style={styles.backIcon}
    //             />
    //             <Text style={styles.headerText}>{GlobalString.SCAN_QR_CODE}</Text>
    //           </View>

    //           <View style={styles.cameraContainer}>
    //             {device ? (
    //               <Camera
    //                 codeScanner={codeScanner}
    //                 device={device}
    //                 ref={camera}
    //                 enableZoomGesture={true}
    //                 style={StyleSheet.absoluteFill}
    //                 focusable={true}
    //                 isActive={isActive}
    //               />
    //             ) : (
    //               // <CameraScreen
    //               //   // Barcode props
    //               //   scanBarcode={isActive}
    //               //   onReadCode={event => {
    //               //     // try {
    //               //     //   setIsActive(false);
    //               //     //   console.log(
    //               //     //     `Scanned ${JSON.stringify(
    //               //     //       codes[0].value,
    //               //     //     )} codes!, ${isActive}`,
    //               //     //   );
    //               //     //   if (
    //               //     //     !isActive &&
    //               //     //     codes?.[0]?.value !== scanData &&
    //               //     //     codes?.[0]?.value
    //               //     //   ) {
    //               //     //     if (codes?.[0]?.value) {
    //               //     //       setScanData(codes?.[0]?.value);
    //               //     //       // addScanData(codes?.[0]?.value);
    //               //     //       handleValidateToken(codes?.[0]?.value);
    //               //     //     } else {
    //               //     //       // showToast({
    //               //     //       //   message: 'No data found !!',
    //               //     //       // });
    //               //     //       setIsActive(true);
    //               //     //       console.log(codes?.[0]?.value);
    //               //     //     }
    //               //     //   } else {
    //               //     //   }
    //               //     // } catch (error) {
    //               //     //   console.log(error);
    //               //     //   resetData();
    //               //     // }
    //               //     console.log(event);
    //               //   }} // optional
    //               //   showFrame={true} // (default false) optional, show frame with transparent layer (qr code or barcode will be read on this area ONLY), start animation for scanner,that stoped when find any code. Frame always at center of the screen
    //               //   laserColor="red" // (default red) optional, color of laser in scanner frame
    //               //   frameColor="white" // (default white) optional, color of border of scanner frame
    //               // />
    //               // <CameraScreen
    //               //   // Barcode props
    //               //   scanBarcode={isActive}
    //               //   onReadCode={event => console.log(event?.data)} // optional
    //               //   showFrame={true} // (default false) optional, show frame with transparent layer (qr code or barcode will be read on this area ONLY), start animation for scanner,that stoped when find any code. Frame always at center of the screen
    //               //   laserColor="red" // (default red) optional, color of laser in scanner frame
    //               //   frameColor="white" // (default white) optional, color of border of scanner frame
    //               // />
    //               <Text style={styles.noCameraText}>{GlobalString.NO_CAMERA}</Text>
    //             )}
    //             <Button
    //               size="md"
    //               variant="outline"
    //               action="primary"
    //               isDisabled={false}
    //               onPress={() => {
    //                 openPhoto();
    //               }}
    //               style={{
    //                 position: 'absolute',
    //                 width: '90%',
    //                 zIndex: 1000000,
    //                 alignSelf: 'center',
    //                 top: '80%',
    //                 borderColor: device
    //                   ? '#fff'
    //                   : styled.config.tokens.colors.basePrimary,
    //                 borderRadius: verticalScale(10),
    //               }}
    //               isFocusVisible={false}>
    //               <ButtonText
    //                 style={{
    //                   color: device
    //                     ? '#fff'
    //                     : styled.config.tokens.colors.basePrimary,
    //                   fontSize: moderateScale(18),
    //                   textAlign: 'center',
    //                 }}>
    //                 Upload From Gallery
    //               </ButtonText>
    //               {/* <ButtonIcon as={AddIcon} /> */}
    //             </Button>
    //           </View>
    // {successModalVisible && (
    //   <View style={styles.modalOverlay}>
    //     {/* Background overlay (fake blur / dim effect) */}
    //     <View
    //       style={[
    //         StyleSheet.absoluteFill,
    //         { backgroundColor: 'rgba(0, 0, 0, 0.7)' }, // darker backdrop
    //       ]}
    //     />

    //     {/* Centered success modal */}
    //     <View style={styles.successModal}>
    //       {/* Close Icon */}
    //       <Icon
    //         as={CloseIcon}
    //         onPress={() => {
    //           setSuccessModalVisible(false);
    //           gotoHome();
    //         }}
    //         style={styles.closeIcon}
    //       />

    //       {/* Success Content */}
    //       <Text style={styles.modalTitle}>
    //         {GlobalString.YOUR_BUZZRING_APP_IS_NOW_ACTIVE}
    //       </Text>

    //       <Text style={styles.modalSubtitle}>
    //         {GlobalString.YOUR_PHONE_WILL_RING_WHEN_SOMEONE_CALLS_YOU}
    //       </Text>

    //       {/* Confirm Button */}
    //       <Button
    //         size="lg"
    //         variant="solid"
    //         action="primary"
    //         style={styles.okButton}
    //         onPress={() => {
    //           setSuccessModalVisible(false);
    //           gotoHome();
    //         }}>
    //         <ButtonText style={styles.okButtonText}>Got it</ButtonText>
    //       </Button>
    //     </View>
    //   </View>
    // )}


    //         </View>
    //       )}
    //     </>
    //   );


    return (
      <>
        <AppLoader showModal={isLoading} />

        {hasPermission && (
          <View style={styles.scannerContainer}>
            <StatusBar barStyle={'light-content'} />

            {/* ✅ Hide entire screen when modal visible */}
            {!successModalVisible && (
              <>
                <View style={styles.headerContainer}>
                  <Icon
                    as={ArrowLeftIcon}
                    color={'white'}
                    onPress={() => {
                      navigation.pop();
                    }}
                    style={styles.backIcon}
                  />
                  <Text style={styles.headerText}>
                    {GlobalString.SCAN_QR_CODE}
                  </Text>
                </View>

                <View style={styles.cameraContainer}>
                  {device ? (
                    <Camera
                      codeScanner={codeScanner}
                      device={device}
                      ref={camera}
                      enableZoomGesture={true}
                      style={StyleSheet.absoluteFill}
                      focusable={true}
                      isActive={isActive}
                    />
                  ) : (
                    <Text style={styles.noCameraText}>{GlobalString.NO_CAMERA}</Text>
                  )}

                  <Button
                    size="md"
                    variant="outline"
                    action="primary"
                    isDisabled={false}
                    onPress={openPhoto}
                    style={{
                      position: 'absolute',
                      width: '90%',
                      zIndex: 1000000,
                      alignSelf: 'center',
                      top: '80%',
                      borderColor: device
                        ? '#fff'
                        : styled.config.tokens.colors.basePrimary,
                      borderRadius: verticalScale(10),
                    }}
                    isFocusVisible={false}>
                    <ButtonText
                      style={{
                        color: device
                          ? '#fff'
                          : styled.config.tokens.colors.basePrimary,
                        fontSize: moderateScale(18),
                        textAlign: 'center',
                      }}>
                      Upload From Gallery
                    </ButtonText>
                  </Button>
                </View>
              </>
            )}

            {/* ✅ Success Modal */}
            {successModalVisible && (
              <View style={styles.modalOverlay}>
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
                  ]}
                />

                <View style={styles.successModal}>
                  <Icon
                    as={CloseIcon}
                    onPress={() => {
                      setSuccessModalVisible(false);
                      gotoHome();
                    }}
                    style={styles.closeIcon}
                  />

                  <Text style={styles.modalTitle}>
                    {GlobalString.YOUR_BUZZRING_APP_IS_NOW_ACTIVE}
                  </Text>

                  <Text style={styles.modalSubtitle}>
                    {GlobalString.YOUR_PHONE_WILL_RING_WHEN_SOMEONE_CALLS_YOU}
                  </Text>

                  <Button
                    size="lg"
                    variant="solid"
                    action="primary"
                    style={styles.okButton}
                    onPress={() => {
                      setSuccessModalVisible(false);
                      gotoHome();
                    }}>
                    <ButtonText style={styles.okButtonText}>Got it</ButtonText>
                  </Button>
                </View>
              </View>
            )}
          </View>
        )}
      </>
    );

  }
