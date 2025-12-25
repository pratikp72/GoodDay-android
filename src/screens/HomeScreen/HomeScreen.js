
import {
  FlatList,
  Image,
  Linking,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Share,
} from 'react-native';
import Switch from 'react-native-switch-toggle';
import React, { useEffect, useState } from 'react';
import style from './HomeScreen.styles';
import { useDispatch, useSelector } from 'react-redux';
import { useCameraPermission } from 'react-native-vision-camera';
import {
  AddIcon,
  Heading,
  Icon,
  Modal,
  ModalBackdrop,
  ModalHeader,
  useStyled,
  LinkIcon,
  SettingsIcon,
  CloseIcon,
  LockIcon,
  CopyIcon,
  MessageCircleIcon
} from '@gluestack-ui/themed';
import { useToastMessage } from '../../hooks/useToastMessage';
import AppLoader from '../../components/AppLoader';
import { ModalContent } from '@gluestack-ui/themed';
import { ModalBody } from '@gluestack-ui/themed';
import { ModalFooter } from '@gluestack-ui/themed';
import { Button } from '@gluestack-ui/themed';
import { ButtonText } from '@gluestack-ui/themed';
import GlobalString from '../../constants/string';
import { SvgXml } from 'react-native-svg';
import { removeUser } from '../../redux/store/scanner/scannerSlice';
import { PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';
import {
  registerDeviceThunk,
  changeSoundPrefrenceThunk,
} from '../../redux/store/auth/authAction';
import { Platform } from 'react-native';
import { requestNotifications } from 'react-native-permissions';
import { deleteUserThunk } from '../../redux/store/scanner/scannerAction';
import { scale } from '../../constants/matrics';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Clipboard from '@react-native-clipboard/clipboard';

import { QuestionIcon } from '../../components/QuestionIcon';
import { DeviceEventEmitter } from 'react-native';

const HomeScreen = ({ navigation }) => {
  const styled = useStyled();
  const styles = style(styled.config.tokens);
  const scanner = useSelector(state => state?.scanner?.data) || [];
  const { loading } = useSelector(state => state.scanner);
  const { hasPermission, requestPermission } = useCameraPermission();
  const { showToast } = useToastMessage();
  const [isOpenSettingModal, setIsOpenSettingModal] = useState(false);
  const [isOpenQuestionModal, setIsOpenQuestionModal] = useState(false)
  const [isShowDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteUser, setDeleteUser] = useState(null);
  const [callRinger, setcallRinger] = useState(false);
  const [messageSound, setmessageSound] = useState(false);
  const dispatch = useDispatch();
  const colorScheme = useColorScheme();
  const [notificationSettings, setnotificationSettings] = useState(false);

  const [notifications, setNotifications] = useState({});

  useEffect(() => {
    // const subscription = DeviceEventEmitter.addListener(
    //   'notificationUpdated',
    //   ({ userId, notifications: updatedNotif }) => {
    //     console.log(' Notification event received:', updatedNotif);

    //     // Update state for that user
    //     setNotifications(prev => ({
    //       ...prev,
    //       [userId]: updatedNotif,
    //     }));
    //   },
    // );
    const subscription = DeviceEventEmitter.addListener(
      'notificationUpdated',
      ({ userId, notifications: updatedNotif }) => {
        // Only update if user still exists in scanner
        // const userExists = scanner.find(u => u.profileId === userId);
        // console.log("jkhjhjghhghgh",userExists)

        // if (!userExists) return;

        setNotifications(prev => ({
          ...prev,
          [userId]: updatedNotif,
        }));
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const fetchNotification = async (userId) => {
    try {
      console.log('Fetching notifications for user:', userId);

      const user = scanner.find(u => u.profileId === userId);
      const token = user?.token;
      const url = `https://api.${user.domain}/api/v1/customers/mobile-notification`
      const response = await fetch(
        `${url}/${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(' Response status:', response.status);

      const json = await response.json();
      console.log(' Notification response for user', userId, ':', JSON.stringify(json, null, 2));

      if (!json.error) {
        setNotifications((prev) => ({
          ...prev,
          [userId]: json,
        }));
      } else {
        console.log(' API returned error for', userId, json.error);
      }
    } catch (err) {
      console.error(' Error fetching notifications for user:', userId, err);
    }
  };

  useEffect(() => {
    try {
      const hasNotificationPermission = PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );

      if (!hasNotificationPermission) {
        PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        showToast({
          message: 'Please give notification permission to receive call.',
        });
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    try {
      async function requestPermissions() {
        if (Platform.OS === 'android') {
          await requestNotifications(['alert', 'sound']);
        }
        if (Platform.OS !== "android") return true;

        const canDraw = await NativeModules.PlatformConstants?.canDrawOverlays;

        if (canDraw) return true;

        Alert.alert(
          "Permission Required",
          "This app needs 'Appear on top' permission to show incoming calls.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Grant Permission",
              onPress: () => {
                Linking.openSettings();
              },
            },
          ]
        );
        try {
          const answerCallPermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ANSWER_PHONE_CALLS
          );

          const manageCallPermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.MANAGE_OWN_CALLS
          );

          if (answerCallPermission && manageCallPermission) {
            console.log("Call permissions already granted");
            return true;
          }

          Alert.alert(
            "Calling Permission Required",
            "To answer or decline calls, please enable Phone Call permissions.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Open Settings",
                onPress: () => {
                  Linking.openSettings();
                },
              },
            ]
          );
        } catch (error) {
          console.warn("Error checking call permissions:", error);
        }
      };
      requestPermissions();
    } catch (error) {
      console.log(error);
    }
  }, []);

  const checkTokenAndRegisterDevice = async () => {
    try {
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        const deviceId = DeviceInfo.getDeviceId();
        console.log(fcmToken, 'fcmToken', deviceId);

        if (deviceId) {
          const data = await dispatch(
            registerDeviceThunk({
              fcmToken: fcmToken,
              deviceId: deviceId,
            }),
          ).unwrap();

          console.log(data, 'Device register data');
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const loadNotificationPrefrences = async () => {
    const call = await AsyncStorage.getItem('notif_call');
    console.log("here iis preference", call)
    if (call == 'true') {
      setcallRinger(true);
      console.log("heeeeeeeeee", callRinger)
    }
    const message = await AsyncStorage.getItem('notif_message');
    if (message == 'true') {
      setmessageSound(true);
    }
  };

  const deleteScannedUser = async item => {
    try {
      setShowDeleteModal(false);
      setDeleteUser(null);
      const payload = {
        scanId: item.scanId,
      };
      const data = await dispatch(deleteUserThunk(payload)).unwrap();
      console.log(data, 'deleted user');
      dispatch(removeUser(item.Id));
      showToast({ message: 'User deleted successfully !!' });
    } catch (error) {
      console.log(error);
      showToast({ message: error?.message });
    }
  };

  useEffect(() => {
    checkTokenAndRegisterDevice();
  }, []);

  useEffect(() => {
    requestPermission();
    loadNotificationPrefrences();
  }, []);

  useEffect(() => {
    console.log('📢 scanner data changed:', scanner);

    if (scanner.length > 0) {
      scanner.forEach((user) => {
        console.log('➡️ About to call fetchNotification for:', user?.profileId);

        if (user?.profileId) {
          fetchNotification(user.profileId);
        }
      });
    }
  }, [scanner]);

  const navigateToScannerScreen = () => {
    navigation.navigate('ScannerScreen');
  };

  const checkCameraPermission = async () => {
    if (hasPermission) {
      navigateToScannerScreen();
    } else {
      const permission = await requestPermission();
      if (permission) {
        navigateToScannerScreen();
      } else {
        setIsOpenSettingModal(true);
      }
    }
  };

  const toggleSoundPreference = async (property, value) => {
    try {
      const soundObj = {
        property: property,
        value: value ? 'Y' : 'N',
      };

      if (property == 'callNotificationSound') {
        setcallRinger(value);
        console.log("callRinger", callRinger)
        await AsyncStorage.setItem('notif_call', value?.toString());
      } else {
        await AsyncStorage.setItem('notif_message', value?.toString());
        setmessageSound(value);
      }
    } catch (error) {
      console.log(error);
      showToast({ message: error?.message });
    }
  };

  const OpenSettingModal = () => {
    return (
      <Modal
        isOpen={isOpenSettingModal}
        alignItems={'center'}
        justifyContent={'center'}
        onClose={() => {
          setIsOpenSettingModal(false);
        }}>
        <ModalBackdrop />
        <ModalContent width={'90%'} height={'auto'}>
          <ModalHeader width={'100%'}>
            <Heading size="sm">{GlobalString.ENABLE_CAMERA_PERMISSION}</Heading>
          </ModalHeader>
          <ModalBody>
            <Text style={{ color: 'black' }}>
              {GlobalString.ENABLE_CAMERA_PERMISSION_SETTING}
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              size="sm"
              action="secondary"
              borderWidth="$0"
              onPress={() => {
                setIsOpenSettingModal(false);
              }}>
              <ButtonText>{GlobalString.CANCEL}</ButtonText>
            </Button>
            <Button
              size="sm"
              variant="outline"
              action="secondary"
              borderWidth="$0"
              onPress={() => {
                Linking.openSettings();
              }}>
              <ButtonText>{GlobalString.GO_TO_SETTINGS}</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  // const EmptyComponent = () => (
  //   <View style={styles.emptyContainer}>
  //     <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
  //       <Image
  //         style={styles.logoImage}
  //         source={{uri: 'https://freedom.buzz/assets/images/icon.jpg'}}
  //       />
  //       <TouchableOpacity
  //         style={{}}
  //         onPress={() => {
  //           checkCameraPermission();
  //         }}>
  //         <Icon
  //           as={AddIcon}
  //           style={[
  //             styles.plusIcon,
  //             {
  //               color: colorScheme === 'dark' ? 'white' : '#212f48',
  //               width: scale(30),
  //               height: scale(30),
  //             },
  //           ]}
  //         />
  //       </TouchableOpacity>
  //     </View>

  //     <ModalFooter></ModalFooter>
  //   </View>
  // );
  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      {/* Logo */}

      <Image
        style={styles.logoImage}
        source={require('../../../assets/Images/logo.jpg')}
      />

      {/* Heading */}
      <View style={{ flex: 1, justifyContent: "center", paddingTop: 20, alignItems: "center" }}>
        <Text style={styles.headingText}>Connect your account</Text>

        {/* Plus Icon with rounded background */}
        <TouchableOpacity
          style={styles.plusButton}
          onPress={checkCameraPermission}
        >
          <Icon
            as={AddIcon}
            style={styles.plusIcon}
          />
        </TouchableOpacity>


        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionText}>
            1. To Register, Scan or Download Images on your device
          </Text>
          <Text style={styles.instructionText}>
            2. Open your QR Scanner app
          </Text>
          <Text style={styles.instructionText}>
            3. Scan the QR code from the image you downloaded or the web version
          </Text>
        </View>
      </View>
    </View>
  );

  const ShowDeleteModal = () => {
    return (
      <Modal
        isOpen={isShowDeleteModal}
        alignItems={'center'}
        justifyContent={'center'}
        onClose={() => {
          setShowDeleteModal(false);
        }}>
        <ModalBackdrop />
        <ModalContent width={'90%'} height={'auto'}>
          <ModalHeader width={'100%'}>
            <Heading size="sm">{GlobalString.DELETE_USER}</Heading>
          </ModalHeader>
          <ModalBody>
            <Text style={{ color: 'black' }}>
              {GlobalString.DELETE_USER_DESC}
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              size="sm"
              action="secondary"
              borderWidth="$0"
              onPress={() => {
                setShowDeleteModal(false);
              }}>
              <ButtonText>{GlobalString.CANCEL}</ButtonText>
            </Button>
            <Button
              size="sm"
              variant="outline"
              action="secondary"
              borderWidth="$0"
              onPress={() => {
                deleteScannedUser(deleteUser);
              }}>
              <ButtonText>{GlobalString.DELETE}</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  // const ShowNotificationSettings = () => {
  //   return (
  //     <Modal isOpen={notificationSettings}>
  //       <ModalBackdrop />
  //       <ModalContent width={'90%'} height={'auto'}>
  //         <ModalHeader width={'100%'}>
  //           <Heading size="lg">Notification Settings</Heading>
  //           <TouchableOpacity
  //             onPress={() => {
  //               setnotificationSettings(false);
  //             }}>
  //             <CloseIcon />
  //           </TouchableOpacity>
  //         </ModalHeader>
  //         <ModalBody>
  //           <View style={{gap: 10, marginVertical: 15}}>
  //             <View
  //               style={{flexDirection: 'row', alignItems: 'center', gap: 20}}>
  //               <Text style={[styles.textStyle]}>
  //                 {GlobalString?.CALL_RINGER}
  //               </Text>
  //               <View
  //                 style={{
  //                   flexDirection: 'row',
  //                   backgroundColor: 'white',
  //                   padding: 1,
  //                   alignItems: 'center',
  //                   gap: 5,
  //                 }}>
  //                 <Text style={styles.textStyle}>
  //                   {callRinger ? 'On' : 'Off'}
  //                 </Text>

  //                 <Switch
  //                   onPress={() =>
  //                     toggleSoundPreference(
  //                       'callNotificationSound',
  //                       !callRinger,
  //                     )
  //                   }
  //                   switchOn={callRinger}
  //                   containerStyle={styles.switchContainer}
  //                   circleStyle={styles.switchCircle}
  //                   circleColorOff={'white'}
  //                   circleColorOn={'white'}
  //                   backgroundColorOn={'#212f48'}
  //                 />
  //               </View>
  //             </View>
  //             <View
  //               style={{flexDirection: 'row', alignItems: 'center', gap: 20}}>
  //               <Text style={[styles.textStyle]}>
  //                 {GlobalString?.MESSAGE_SOUND}
  //               </Text>
  //               <View
  //                 style={{
  //                   flexDirection: 'row',
  //                   backgroundColor: 'white',

  //                   alignItems: 'center',
  //                   gap: 5,
  //                 }}>
  //                 <Text style={styles.textStyle}>
  //                   {messageSound ? 'On' : 'Off'}
  //                 </Text>
  //                 <Switch
  //                   onPress={() =>
  //                     toggleSoundPreference(
  //                       'messageNotificationSound',
  //                       !messageSound,
  //                     )
  //                   }
  //                   switchOn={messageSound}
  //                   containerStyle={styles.switchContainer}
  //                   circleStyle={styles.switchCircle}
  //                   circleColorOff={'white'}
  //                   circleColorOn={'white'}
  //                   backgroundColorOn={'#212f48'}
  //                 />
  //               </View>
  //             </View>
  //           </View>
  //         </ModalBody>
  //       </ModalContent>
  //     </Modal>
  //   );
  // };
  const ShowNotificationSettings = ({ item }) => {
    return (
      <Modal isOpen={notificationSettings}>
        <ModalBackdrop />
        <ModalContent width={'90%'} height={'auto'}>
          <ModalHeader
            width={'100%'}
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Heading size="lg">Notification Settings</Heading>
            <TouchableOpacity
              onPress={() => {
                setnotificationSettings(false);
              }}>
              <CloseIcon />
            </TouchableOpacity>
          </ModalHeader>

          <ModalBody>
            <View style={{ gap: 10, marginVertical: 15 }}>
              {/* CALL RINGER */}
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
                <Text style={[styles.textStyle]}>
                  {GlobalString?.CALL_RINGER}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',

                    padding: 1,
                    alignItems: 'center',
                    gap: 5,
                  }}>
                  <Text style={styles.textStyle}>
                    {callRinger ? 'On' : 'Off'}
                  </Text>

                  <Switch
                    onPress={() =>
                      toggleSoundPreference('callNotificationSound', !callRinger)
                    }
                    switchOn={callRinger}
                    containerStyle={styles.switchContainer}
                    circleStyle={styles.switchCircle}
                    circleColorOff={'white'}
                    circleColorOn={'white'}
                    backgroundColorOn={'#212f48'}
                  />
                </View>
              </View>

              {/* MESSAGE SOUND */}
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
                <Text style={[styles.textStyle]}>
                  {GlobalString?.MESSAGE_SOUND}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',

                    alignItems: 'center',
                    gap: 5,
                  }}>
                  <Text style={styles.textStyle}>
                    {messageSound ? 'On' : 'Off'}
                  </Text>
                  <Switch
                    onPress={() =>
                      toggleSoundPreference(
                        'messageNotificationSound',
                        !messageSound,
                      )
                    }
                    switchOn={messageSound}
                    containerStyle={styles.switchContainer}
                    circleStyle={styles.switchCircle}
                    circleColorOff={'white'}
                    circleColorOn={'white'}
                    backgroundColorOn={'#212f48'}
                  />
                </View>
              </View>
            </View>


            <View
              style={{
                marginTop: 25,
                borderTopWidth: 1,
                borderTopColor: '#eee',
                paddingTop: 15,
                alignItems: 'center',
              }}>
              <TouchableOpacity
                onPress={() => {
                  setDeleteUser(item);
                  setShowDeleteModal(true);

                  setnotificationSettings(false);

                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: '#ffe5e5',
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 10,
                }}>
                <SvgXml
                  xml={`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="22px" height="22px" fill="red"><path d="M 10.806641 2 C 10.289641 2 9.7956875 2.2043125 9.4296875 2.5703125 L 9 3 L 4 3 A 1.0001 1.0001 0 1 0 4 5 L 20 5 A 1.0001 1.0001 0 1 0 20 3 L 15 3 L 14.570312 2.5703125 C 14.205312 2.2043125 13.710359 2 13.193359 2 L 10.806641 2 z M 4.3652344 7 L 5.8925781 20.263672 C 6.0245781 21.253672 6.877 22 7.875 22 L 16.123047 22 C 17.121047 22 17.974422 21.254859 18.107422 20.255859 L 19.634766 7 L 4.3652344 7 z"/></svg>`}
                />
                <Text style={{ color: 'red', fontWeight: '600', fontSize: 16 }}>
                  Delete Account
                </Text>
              </TouchableOpacity>
            </View>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  };

const ShowQuestionModel = () => {
  return (
    <Modal isOpen={isOpenQuestionModal}>
      <ModalBackdrop />
      <ModalContent width={'90%'} height={'auto'} backgroundColor={colors.cardBackground}>
        <ModalHeader 
          width={'100%'}
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Heading size="lg" style={{ color: "red" }}>App Instructions</Heading>
          <TouchableOpacity
            onPress={() => {
              setIsOpenQuestionModal(false);
            }}>
            <CloseIcon color={colors.text} />
          </TouchableOpacity>
        </ModalHeader>

        <ModalBody style={{ paddingBottom: 20 }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Top Notice */}
            <View style={{ marginBottom: 15 }}>
              <Text
                style={[
                  styles.textStyle,
                  { color: colors.text, fontWeight: "bold" },
                ]}
              >
                The Goodday chat is only used to make a connection between the
                encrypted website and your device.
              </Text>
            </View>

            {/* Website Login Requirement */}
            <View style={{ marginBottom: 18 }}>
              <Text
                style={[
                  styles.textStyle,
                  {
                    color: colors.text,
                    fontWeight: "bold",
                  },
                ]}
              >
                NOTE:
              </Text>
<Text
  style={[
    styles.textStyle,
    {
      color: colors.text,
      marginTop: 5,
      lineHeight: 20,
    },
  ]}
>
  You must be logged into
  <Text
    style={{ color:colors.mainText, textDecorationLine: 'underline' }}
    onPress={() => Linking.openURL('https://goodday.chat')}
  >
    {" https://goodday.chat/ "}
  </Text>
  Messaging to send or receive messages, or make or receive calls.
  This is required to keep communication encrypted.
</Text>

            </View>

            {/* Section Header */}
            <Text
              style={[
                styles.textStyle,
                {
                  color: colors.text,
                  fontWeight: "bold",
                  fontSize: 16,
                  marginBottom: 10,
                  marginTop: 10,
                },
              ]}
            >
              Encrypted Calling
            </Text>

            {/* Receive Calls */}
            <View style={{ marginBottom: 15 }}>
              <Text
                style={[
                  styles.textStyle,
                  { color: colors.text, fontWeight: "bold" },
                ]}
              >
                Receive Calls:
              </Text>

              <Text
                style={[
                  styles.textStyle,
                  { color: colors.text, paddingTop: 5, lineHeight: 20 },
                ]}
              >
                • Text your Call Link or copy and email your Call Link to
                recipients so they can click your Call Link to call you.
              </Text>

              <Text
                style={[
                  styles.textStyle,
                  {
                    color: colors.text,
                    paddingTop: 5,
                    fontWeight: "bold",
                  },
                ]}
              >
                ASK THEM TO SAVE IT TO YOUR CONTACT INFORMATION.
              </Text>
            </View>

            {/* Make Calls */}
            <View style={{ marginBottom: 15 }}>
              <Text
                style={[
                  styles.textStyle,
                  { color: colors.text, fontWeight: "bold" },
                ]}
              >
                Make Calls:
              </Text>

              <Text
                style={[
                  styles.textStyle,
                  { color: colors.text, paddingTop: 5, lineHeight: 20 },
                ]}
              >
                • You must have someone’s Call Link to call them. They must text
                or email you their Call Link.
              </Text>

              <Text
                style={[
                  styles.textStyle,
                  {
                    color: colors.text,
                    paddingTop: 5,
                    fontWeight: "bold",
                  },
                ]}
              >
                SAVE THEIR CALL LINK TO THEIR CONTACT INFO ON YOUR DEVICE.
              </Text>
            </View>

            {/* Messaging */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={[
                  styles.textStyle,
                  { color: colors.text, fontWeight: "bold" },
                ]}
              >
                Messaging:
              </Text>

              <Text
  style={[
    styles.textStyle,
    { color: colors.text, paddingTop: 5, lineHeight: 20 },
  ]}
>
  Log into your
  <Text
    style={{ color:colors.mainText, textDecorationLine: 'underline' }}
    onPress={() => Linking.openURL('https://goodday.chat/')}
  >
    {"https://goodday.chat/"}
  </Text>
  account to check, receive, or send encrypted messages.
</Text>

            </View>


           
          </ScrollView>
        </ModalBody>

      </ModalContent>
    </Modal>
  );
};


  const CallLinkView = ({ data }) => {
    const [userName, setUserName] = useState('');

    useEffect(() => {
      handleSlugify(data?.Username);
    }, [data]);

    const handleSlugify = (str) => {
      setUserName(
        str?.length > 0
          ? str
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '')
          : ''
      );
    };

    const handleCopy = () => {
      Clipboard.setString(`https://${data?.domain}/facetime/${userName}`);
      showToast({ message: 'The URL has been copied to clipboard.' });
    };

    const handleShare = async () => {
      try {
        await Share.share({
          message: `Check this out: https://${data?.domain}/facetime/${userName}`,
          url: `https://${data?.domain}/facetime/${userName}`,
          title: 'My Cool URL',
        });
      } catch (error) {
        console.error('Error sharing:', error.message);
      }
    };

    return (
      <View
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 14,
          padding: 16,
          margin: 15,
          marginBottom: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
          elevation: 4,
        }}
      >
        {/* Description */}
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1a1a2e' }}>
            Call Link{' '}
            <Text
              style={{
                fontSize: 14,
                color: '#555555',
                lineHeight: 20,
                fontWeight: '400',
              }}
            >
              Share your Call Link so people can send encrypted messages or start video calls with you
            </Text>
          </Text>
        </View>

        {/* Highlighted URL */}
        <View
          style={{
            marginBottom: 16,
            padding: 12,
            borderRadius: 8,
            backgroundColor: '#f0f8ff', // light highlight
          }}
        >
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{
              fontSize: 15,
              fontWeight: '600',
              color: '#1a73e8', // highlight color for URL
            }}
          >
            {`https://${data?.domain}/facetime/${userName}`}
          </Text>
        </View>

        {/* Buttons */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          {/* Copy Button */}
          <TouchableOpacity
            onPress={handleCopy}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: '#1a73e8', // border color same as URL
              borderRadius: 8,
              paddingVertical: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >

            <Icon as={CopyIcon} size="xl" color="#1a73e8" />
            <Text style={{ color: '#1a73e8', fontWeight: '600', fontSize: 14 }}>
              Copy
            </Text>
          </TouchableOpacity>

          {/* SMS/Share Button */}
          <TouchableOpacity
            onPress={handleShare}
            style={{
              flex: 1,

              backgroundColor: '#e8e8e8',
              borderColor: "green",
              borderWidth: 1,
              borderRadius: 8,
              paddingVertical: 12,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 3
            }}
          >
            {/* <Image
            style={{ width: 35, height: 28 }}
            resizeMode="contain"
            source={{ uri: 'https://dev.freedom.buzz/assets/images/sms-light.png' }}
          /> */}

            <Icon as={MessageCircleIcon} size="xl" color="green" />
            <Text style={{ color: 'green', fontWeight: '600', fontSize: 14 }}>
              SMS
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <>
      <AppLoader showModal={loading} />
      <OpenSettingModal />
      {<ShowNotificationSettings item={scanner} />}
      {<ShowQuestionModel />}
      <ShowDeleteModal isShow={isShowDeleteModal} />
      <View style={styles.mainContainer}>
        <StatusBar barStyle={'light-content'} />

        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Goodday Chat</Text>
          {scanner.length > 0 && (
            <>
              <TouchableOpacity
                style={{ alignSelf: 'center', marginRight: 10, top: 1 }}
                onPress={() => {
                  setIsOpenQuestionModal(true);
                }}>
                <Icon as={QuestionIcon} style={[styles.plusOther, { height: 50, width: 50 }]} />
              </TouchableOpacity>
              <TouchableOpacity
                style={{ alignSelf: 'center', marginRight: 10 }}
                onPress={() => {
                  setnotificationSettings(true);
                }}>
                <Icon as={SettingsIcon} style={styles.plusOther} />
              </TouchableOpacity>
            </>
          )}
          {scanner.length > 0 && (
            <TouchableOpacity
              style={{ alignSelf: 'center', top: 3 }}
              onPress={() => {
                checkCameraPermission();
              }}>
              <Icon as={AddIcon} style={styles.plusIcon} />
            </TouchableOpacity>
          )}
        </View>

        <View>
          <FlatList
            scrollEnabled={false}
            data={scanner}
            numColumns={2}
            contentContainerStyle={{
              flexGrow: 1,
            }}
            keyExtractor={item => item?.Id?.toString()}
            ListHeaderComponent={() => scanner.length > 0 ? <CallLinkView data={scanner[0]} /> : null}
            ListEmptyComponent={EmptyComponent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.scannedDataContainer}>
                {/* <Image
                  source={{uri: item.ProfilePicName}}
                  style={styles.scannedImage}
                /> */}


                <Text style={styles.scannedText}>@{item?.Username}</Text>


                <View
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 14,
                    paddingVertical: 16,
                    paddingHorizontal: 18,
                    // marginVertical: 10,
                    gap: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 4,
                    elevation: 3,
                    justifyContent: "center",
                    alignItems: 'center'
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: "center", gap: 4, justifyContent: "center" }}>

                    <Image
                      source={require('./../../../assets/Images/lock.png')}
                      style={{ width: 20, height: 20 }}
                    />
                    {/* <Text
                    style={{
                      color: '#1a1a2e',
                      fontSize: 16,
                      fontWeight: '600',
                      marginBottom: 0,
                      textAlign: 'center',
                    }}
                  >
                   Check  Notifications
                  </Text> */}

                    <TouchableOpacity
                      onPress={() => {
                        if (!item?.domain) return;

                        const url =
                          item.domain.startsWith('http://') || item.domain.startsWith('https://')
                            ? item.domain
                            : `https://${item.domain}/profile-chats?token=${item.token}`;

                        Linking.openURL(url).catch(err => {
                          console.log("Failed to open URL:", err);
                        });
                      }}
                    >
                      <Text style={{
                        color: '#1a1a2e',
                        fontSize: 16,
                        fontWeight: '600',
                        marginBottom: 0,
                        textAlign: 'center',
                        textDecorationLine: "underline"
                      }}>
                        Check Notifications
                      </Text>
                    </TouchableOpacity>

                  </View>
                  <Text
                    style={{
                      color: '#3b3b58',
                      fontSize: 14,
                      fontWeight: '500',
                      lineHeight: 20,
                    }}
                  >
                    Missed Calls:{' '}
                    <Text style={{ fontWeight: '600' }}>
                      {notifications[item.profileId]?.videoCall ?? '0'}
                    </Text>
                  </Text>

                  <Text
                    style={{
                      color: '#3b3b58',
                      fontSize: 14,
                      fontWeight: '500',
                      lineHeight: 20,
                    }}
                  >
                    Messages:{' '}
                    <Text style={{ fontWeight: '600' }}>
                      {notifications[item.profileId]?.message ?? '0'}
                    </Text>
                  </Text>
                </View>

                <Text style={styles.noteText}>
                  {`NOTE: You must be logged ${item?.domain} to use this app`}
                </Text>
                <View style={{ gap: 10, margin: 3 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                      marginRight: 10,
                      // marginBottom: 10,
                      justifyContent: 'space-between',
                    }}>
                    <Text style={styles.notificationText}>
                      {'Notification Settings'}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
                    <Text style={[styles.textStyle]}>{GlobalString?.CALL_RINGER}</Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        backgroundColor: 'white',
                        padding: 1,
                        alignItems: 'center',
                        gap: 5,
                      }}>
                      <Text style={styles.textStyle}>{callRinger ? 'On' : 'Off'}</Text>

                      <Switch
                        onPress={() =>
                          toggleSoundPreference('callNotificationSound', !callRinger)
                        }
                        switchOn={callRinger}
                        containerStyle={styles.switchContainer}
                        circleStyle={styles.switchCircle}
                        circleColorOff={'white'}
                        circleColorOn={'white'}
                        backgroundColorOn={'#212f48'}
                      />
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
                    <Text style={[styles.textStyle]}>
                      {GlobalString?.MESSAGE_SOUND}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        backgroundColor: 'white',
                        alignItems: 'center',
                        gap: 5,
                      }}>
                      <Text style={styles.textStyle}>
                        {messageSound ? 'On' : 'Off'}
                      </Text>
                      <Switch
                        onPress={() =>
                          toggleSoundPreference(
                            'messageNotificationSound',
                            !messageSound,
                          )
                        }
                        switchOn={messageSound}
                        containerStyle={styles.switchContainer}
                        circleStyle={styles.switchCircle}
                        circleColorOff={'white'}
                        circleColorOn={'white'}
                        backgroundColorOn={'#212f48'}
                      />
                    </View>
                  </View>
                </View>


                {/* <TouchableOpacity
  onPress={async () => {
    if (item?.domain) {
      // Ensure protocol exists
      const url = item.domain.startsWith('http://') || item.domain.startsWith('https://')
        ? item.domain
        : `https://${item.domain}/profile-chats`;

      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log("Can't open this URL:", url);
      }
    }
  }}
>
  <Text style={[styles.scannedText, { textDecorationLine: 'underline' }]}>
    {item?.domain}
  </Text>
</TouchableOpacity> */}


              </View>
            )}
          />


        </View>


      </View>
    </>
  );
};

export default HomeScreen;