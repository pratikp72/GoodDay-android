import { AppRegistry, DeviceEventEmitter, Linking } from 'react-native';

import App from './App';

import { name as appName } from './app.json';

import 'react-native-gesture-handler';

import messaging from '@react-native-firebase/messaging';

import RNNotificationCall from 'react-native-full-screen-notification-incoming-call';

import io from 'socket.io-client';

import { store } from './src/redux/store';

import { env } from './src/config';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { Notifications } from 'react-native-notifications';

import PushNotification from 'react-native-push-notification';

import { PermissionsAndroid, Platform, Alert } from 'react-native';

// messaging()
//   .getToken()
//   .then(token => console.log("FCM Token:", token));

const connectSocket = (token) => {
  const socket = io('https://ring-api.goodday.chat', {
    transports: ['websocket', 'polling'],
    auth: { Authorization: `Bearer ${token}` },
    reconnectionAttempts: 5000,
  });

  socket.on('connect', () =>
    console.log('✅ Socket connected for auto notification:', socket.id)
  );

  socket.on('connect_error', (err) =>
    console.log('❌ Connect error for notification socket:', err)
  );

  socket.on('disconnect', (reason) =>
    console.log('🔌 Socket disconnected:', reason)
  );

  // ✅ Listen for all incoming events
  socket.onAny(async (event, data) => {
    if (event === 'isReadNotification_ack') {
      console.log('🔔 Notification ack received:', data);

      // Ensure valid data structure
      const userId = data?.profileId;
      const isRead = data?.isRead;

      if (!userId) {
        console.warn('⚠️ Missing profileId in isReadNotification_ack');
        return;
      }

      if (isRead === 'Y') {
        try {
          console.log(`📬 Fetching updated notifications for user ${userId}...`);
          const notifResponse = await fetchNotification(userId);
          console.log('✅ Updated notifications:', notifResponse);

          // Emit event to update UI in app
          DeviceEventEmitter.emit('notificationUpdated', {
            userId,
            notifications: notifResponse,
          });
        } catch (error) {
          console.error('❌ Error fetching notifications after ack:', error);
        }
      }
    }
  });

  return socket;
};

export const checkFirstLaunchForDeepLinks = async () => {
  if (Platform.OS !== 'android' || Platform.Version < 31) return;

  const hasLaunched = await AsyncStorage.getItem('hasLaunchedDeepLinkPrompt');
  if (!hasLaunched) {
    AsyncStorage.setItem('hasLaunchedDeepLinkPrompt', 'true');
    Alert.alert(
      'Enable App Links',
      'To open links directly in this app, please enable "Open supported links" in App Info → Open by default → Add link → add freedom.buzz',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Go to Settings',
          onPress: () => {
            Linking.openSettings(); // opens app settings where user can enable supported links
          },
        },
      ],
      { cancelable: true }
    );
  }
};

export const initSocket = () => {
  const state = store.getState();
  const scanner = state?.scanner?.data || [];
  scanner.forEach(user => {
    if (user?.token) {
      const socket = connectSocket(user.token);
      // join private room if needed
      socket.emit('join', { room: user.profileId });
    }
  });
};

// Call initSocket() somewhere after store is populated

export const configurePushNotifications = () => {
  PushNotification.createChannel(
    {
      channelId: 'messages',
      channelName: 'Messages',
      channelDescription: 'Notification channel for new chat messages',
      importance: 4,
      vibrate: true,
    },
    (created) => console.log(`Channel created: ${created}`),
  );

  // Create call notification channel for Android 14+
  PushNotification.createChannel(
    {
      channelId: 'incoming_calls',
      channelName: 'Incoming Calls',
      channelDescription: 'Notification channel for incoming video calls',
      importance: 4,
      vibrate: true,
      soundName: 'surprise_vibes',
    },
    (created) => console.log(`Call channel created: ${created}`),
  );
};

export const requestNotificationPermission = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Notification Permission',
          message:
            'This app needs permission to show incoming call and message notifications.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('✅ Notification permission granted');
      } else {
        console.warn('🚫 Notification permission denied');
        Alert.alert(
          'Notifications Disabled',
          'Please enable notifications in Settings to receive calls and messages.'
        );
      }
    } catch (err) {
      console.warn('Error requesting notification permission:', err);
    }
  }
};

const displayLocalMessageNotification = (data) => {
  PushNotification.localNotification({
    channelId: 'messages',
    title: data?.Username || 'New Message',
    message: data?.notificationDesc || 'You have a new message!',
    largeIconUrl: data?.ProfilePicName,
    smallIcon: 'ic_launcher',
    playSound: true,
    soundName: 'message_notification',
    color: '#212f48',
    priority: 'max',
    importance: 'max',
    userInfo: { data },
  });
};

const fetchNotification = async userId => {
  console.log("here issssssssss..........")
  try {
    const state = store.getState();
    const scanner = state?.scanner?.data || [];
    const user = scanner.find(u => u.profileId === userId);
    const token = user?.token;

    const userExists = scanner.find(u => u.profileId === userId);
    console.log("jkhjhjghhghgh", userExists)

    if (!user) return;
    if (!token) {
      console.warn(' No token found for user', userId);
      return;
    }

    console.log('🔄 Fetching notifications for user:', userId);
    console.log("user domain....", user.domain)

    const url = `https://api.${user.domain}/api/v1/customers/mobile-notification`

    const response = await fetch(
      `${url}/${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const json = await response.json();
    console.log(' Notification response for user', userId, ':', json);
    return json;
  } catch (err) {
    console.error('Error fetching notifications for user:', userId, err);
  }
};

const shouldDisplayNotification = async data => {
  if (data?.actionType === 'VC') {
    const callPref = await AsyncStorage.getItem('notif_call');
    return callPref === 'true';
  } else {
    const msgPref = await AsyncStorage.getItem('notif_message');
    return msgPref === 'true';
  }
};

const shouldShowNotification = (data) => {
  const state = store.getState();
  const userExists = state?.scanner?.data?.some(u => u.profileId === data.notificationToProfileId);
  return userExists;
};

function returnNotificationData(remoteMessage) {
  console.log("Raw Remote Message:", JSON.stringify(remoteMessage));
  const data = JSON.parse(remoteMessage?.data?.body);
  console.log("here is notification data", data)

  const {
    ProfilePicName,
    Username,
    actionType,
    link,
    notificationByProfileId,
    notificationDesc,
    notificationToProfileId,
    domain,
  } = data;

  return data;
}

// Track if event listeners are already registered
let eventListenersRegistered = false;

function addRNCallEventListener() {
  // Prevent multiple registrations
  if (eventListenersRegistered) {
    console.log('⚠️ Event listeners already registered, skipping...');
    return;
  }

  eventListenersRegistered = true;
  let isCalled = false;

  // Helper to get user from scanner state
  const getUser = (profileId) => {
    try {
      const state = store.getState();
      const scannerData = state?.scanner?.data;
      if (!Array.isArray(scannerData)) return null;
      return scannerData.find(item => item.profileId === profileId) || null;
    } catch (error) {
      console.error('Error getting user from state:', error);
      return null;
    }
  };

  const connectSocketForCall = (token) => {
    const socket = io('https://ring-api.goodday.chat', {
      transports: ['websocket', 'polling'],
      reconnectionDelayMax: 300,
      reconnectionAttempts: 5000,
      randomizationFactor: 0.2,
      auth: { Authorization: `Bearer ${token}` },
    });

    socket.on('connect', () => console.log('✅ Socket connected', socket.id));
    socket.on('connect_error', (err) => console.log('❌ Connect error:', JSON.stringify(err)));
    socket.on('disconnect', (reason) => console.log('🔌 Socket disconnected:', reason));

    return socket;
  };

  RNNotificationCall.addEventListener('endCall', async data => {
    if (isCalled) {
      console.log('⚠️ Call already being processed');
      return;
    }

    isCalled = true;

    try {
      const { callUUID, payload } = data;
      if (!payload) {
        console.warn('No payload received on answer');
        isCalled = false;
        return;
      }

      let callData;
      try {
        // Handle both object and string payload
        if (typeof payload === 'string') {
          callData = JSON.parse(payload);
        } else if (typeof payload === 'object') {
          callData = payload;
        } else {
          console.warn('Unexpected payload type:', typeof payload);
          isCalled = false;
          return;
        }
      } catch (err) {
        console.warn('Failed to parse payload on answer:', payload, err);
        isCalled = false;
        return;
      }

      console.log('📞 Answer pressed:', callUUID, callData);

      // Get user token for socket connection
      const user = getUser(callData?.data?.notificationToProfileId);
      if (!user) {
        console.error('User not found for answer call');
        isCalled = false;
        return;
      }

      const socket = connectSocketForCall(user.token);
      let linkOpened = false;

      // Set timeout to open link if socket doesn't connect quickly
      const linkTimeout = setTimeout(() => {
        if (!linkOpened && callData?.data?.link) {
          console.log('⏱️ Opening link via timeout (socket taking too long)');
          Linking.openURL(callData.data.link).catch(err => {
            console.error('❌ Error opening link:', err);
          });
          linkOpened = true;
          RNNotificationCall.hideNotification();
        }
      }, 2000); // 2 second timeout

      socket.on('connect', async () => {
        try {
          console.log('<--- Socket connected for pickup --->', socket.id);

          // Ensure socket joins the correct room first
          if (callData?.data?.roomId) {
            socket.emit('join', { room: callData.data.roomId });
            console.log("Joined room:", callData.data.roomId);
          } else if (callData?.data?.groupId) {
            socket.emit('join', { room: callData.data.groupId });
            console.log("Joined group:", callData.data.groupId);
          }

          console.log("here is a link", callData?.data?.link);

          // Wait a bit for room join to complete
          // await new Promise(resolve => setTimeout(resolve, 200));

          socket.emit(
            'pick-up-call',
            {
              notificationToProfileId: callData?.data?.notificationByProfileId,
              roomId: callData?.data?.roomId,
              groupId: callData?.data?.groupId,
              notificationByProfileId: callData?.data?.notificationToProfileId,
              link: callData?.data?.link,
              domain: callData?.data?.domain || user.domain,
            },
            response => {
              clearTimeout(linkTimeout);
              console.log('✅ pick-up-call response:', response);

              if (response && !linkOpened) {
                // Open the call link (WebRTC / Facetime)
                console.log("Opening link via response");
                Linking.openURL(callData.data.link)
                  .then(() => {
                    console.log('✅ Link opened successfully');
                    linkOpened = true;
                  })
                  .catch(err => {
                    console.error('❌ Error opening link:', err);
                  });
                RNNotificationCall.hideNotification();
              } else if (!response) {
                console.warn('Pick-up-call failed on server');
                // Still try to open link even if server response is negative
                if (!linkOpened && callData?.data?.link) {
                  Linking.openURL(callData.data.link).catch(err => {
                    console.error('❌ Error opening link:', err);
                  });
                  linkOpened = true;
                }
              }

              // Clean up socket after a delay
              setTimeout(() => {
                socket.disconnect();
                isCalled = false;
              }, 1000);
            }
          );
        } catch (error) {
          console.error('❌ Error in answer handler:', error);
          clearTimeout(linkTimeout);
          // Still try to open link on error
          if (!linkOpened && callData?.data?.link) {
            Linking.openURL(callData.data.link).catch(err => {
              console.error('❌ Error opening link:', err);
            });
            linkOpened = true;
          }
          RNNotificationCall.hideNotification();
          isCalled = false;
        }
      });

      socket.on('connect_error', (err) => {
        console.error('❌ Socket connection error:', err);
        clearTimeout(linkTimeout);
        // Open link even if socket fails
        if (!linkOpened && callData?.data?.link) {
          Linking.openURL(callData.data.link).catch(err => {
            console.error('❌ Error opening link:', err);
          });
          linkOpened = true;
        }
        RNNotificationCall.hideNotification();
        isCalled = false;
      });

      // Timeout if socket doesn't connect within 3 seconds
      setTimeout(() => {
        if (!socket.connected && !linkOpened && callData?.data?.link) {
          console.warn('⚠️ Socket connection timeout, opening link directly');
          clearTimeout(linkTimeout);
          Linking.openURL(callData.data.link).catch(err => {
            console.error('❌ Error opening link:', err);
          });
          linkOpened = true;
          RNNotificationCall.hideNotification();
          socket.disconnect();
          isCalled = false;
        }
      }, 3000);

    } catch (error) {
      console.error('❌ Error in answer event handler:', error);
      isCalled = false;
    }
  });

  RNNotificationCall.addEventListener('answer', async data => {
    try {
      console.log("this is call data: ", data);

      const { callUUID, payload } = data;
      RNNotificationCall.hideNotification();

      if (!payload) {
        console.warn('No payload received on endCall');
        return;
      }

      let callData;
      try {
        // Handle both object and string payload
        if (typeof payload === 'string') {
          callData = JSON.parse(payload);
        } else if (typeof payload === 'object') {
          callData = payload;
        } else {
          console.warn('Unexpected payload type:', typeof payload);
          return;
        }
      } catch (err) {
        console.warn('Failed to parse payload on endCall:', payload, err);
        return;
      }

      console.log('📞 End call pressed:', callUUID, callData);

      const userId = callData?.data?.notificationToProfileId;
      const user = getUser(userId);
      if (!user) {
        console.error('User not found for decline call');
        return;
      }

      const socket = connectSocketForCall(user.token);
      let declineEmitted = false;

      socket.on('connect', async () => {
        try {
          console.log('<--- Socket connected for decline --->', socket.id);
          console.log('roomId:', callData?.data?.roomId);
          console.log('groupId:', callData?.data?.groupId);

          // Ensure socket joins the correct room first (IMPORTANT!)
          if (callData?.data?.roomId) {
            socket.emit('join', { room: callData.data.roomId });
            console.log("Joined room for decline:", callData.data.roomId);
          } else if (callData?.data?.groupId) {
            socket.emit('join', { room: callData.data.groupId });
            console.log("Joined group for decline:", callData.data.groupId);
          }

          // Wait a moment for room join to complete, then emit decline-call
          // setTimeout(() => {
          if (!declineEmitted) {
            console.log("----------------------------------Going for Decline Emit");

            declineEmitted = true;
            socket.emit(
              'decline-call',
              {
                notificationToProfileId: callData?.data?.notificationByProfileId,
                roomId: callData?.data?.roomId,
                groupId: callData?.data?.groupId,
                notificationByProfileId: callData?.data?.notificationToProfileId,
                members: callData?.data?.members || 0,
                domain: callData?.data?.domain || user.domain,
                actionType: "DC",
              },
              response => {
                console.log('📞 decline-call response:', response);
                RNNotificationCall.hideNotification();

                // Fetch updated notifications
                fetchNotification(userId)
                  .then(notifResponse => {
                    console.log('🔄 Updated notifications:', notifResponse);
                    DeviceEventEmitter.emit('notificationUpdated', {
                      userId,
                      notifications: notifResponse,
                    });
                  })
                  .catch(err => console.warn('Failed to fetch notifications:', err));

                setTimeout(() => {
                  socket.disconnect();
                }, 500);
              }
            );
          }
          // }, 100); // Increased delay to ensure room join completes

          // Fallback: emit decline even if no response after timeout
          setTimeout(() => {
            if (!declineEmitted) {
              console.warn('⚠️ No response from decline-call, disconnecting');
              socket.disconnect();
            }
          }, 5000);
        } catch (error) {
          console.error('❌ Error in endCall handler:', error);
          socket.disconnect();
        }
      });

      socket.on('connect_error', (err) => {
        console.error('❌ Socket connection error for decline:', err);
        socket.disconnect();
      });

      // Timeout if socket doesn't connect
      setTimeout(() => {
        if (!socket.connected) {
          console.warn('⚠️ Socket connection timeout for decline');
          socket.disconnect();
        }
      }, 3000);

    } catch (error) {
      console.error('❌ Error in endCall event handler:', error);
    }
  });
}

const displayMessageNotification = async data => {
  try {
    configurePushNotifications();
    displayLocalMessageNotification(data);
  } catch (error) {
    console.error('Error displaying message notification:', error);
  }
};

const displayIncomingCall = data => {
  try {
    // Ensure notification channels are created before displaying
    configurePushNotifications();

    // Create a clean, serializable payload object with only necessary fields
    // This prevents issues with non-serializable properties or circular references
    const cleanData = {
      ProfilePicName: data?.ProfilePicName || null,
      Username: data?.Username || null,
      actionType: data?.actionType || null,
      link: data?.link || null,
      notificationByProfileId: data?.notificationByProfileId || null,
      notificationDesc: data?.notificationDesc || null,
      notificationToProfileId: data?.notificationToProfileId || null,
      domain: data?.domain || null,
      roomId: data?.roomId || null,
      groupId: data?.groupId || null,
      members: data?.members || 0,
    };

    // Remove null/undefined values to keep payload clean
    Object.keys(cleanData).forEach(key => {
      if (cleanData[key] === null || cleanData[key] === undefined) {
        delete cleanData[key];
      }
    });

    const payloadObject = { data: cleanData };

    RNNotificationCall.displayNotification(
      `${data?.notificationByProfileId}-${data?.notificationToProfileId}`,
      data?.ProfilePicName,
      30000,
      {
        channelId: `${data?.notificationByProfileId}-${data?.notificationToProfileId}`,
        channelName: 'Incoming call',
        notificationIcon: 'ic_launcher', //mipmap
        notificationTitle: data?.Username,
        notificationBody: 'Incoming call • ' + data?.domain,
        answerText: 'Decline',
        declineText: 'Answer',
        payload: payloadObject, // Pass as plain object - library handles serialization
        notificationColor: 'colorAccent',
        //  isFullScreen: true, 
        notificationSound: 'surprise_vibes', //raw
      },
    );
  } catch (error) {
    console.error('Error displaying incoming call:', error);
  }
};

messaging().setBackgroundMessageHandler(async remoteMessage => {
  try {
    const data = returnNotificationData(remoteMessage);
    console.log('Message handled in the background!', data);

    const shouldShow = await shouldDisplayNotification(data);
    if (!shouldShowNotification(data)) {
      console.log('Notification ignored because user is deleted');
      return;
    }

    if (!shouldShow) return;

    // Ensure event listeners are set up
    addRNCallEventListener();

    if (data?.actionType == 'VC') {
      displayIncomingCall(data);
    } else if (data?.actionType === 'M') {
      displayMessageNotification(data);
      const notifResponse = await fetchNotification(data.notificationToProfileId);
      DeviceEventEmitter.emit('notificationUpdated', {
        userId: data.notificationToProfileId,
        notifications: notifResponse,
      });
    } else {
      RNNotificationCall.declineCall(
        `${data?.notificationByProfileId}-${data?.notificationToProfileId}`,
      );
      console.log('Fetching notifications after call end...');
      const notifResponse = await fetchNotification(data.notificationToProfileId);
      console.log(' Updated notifications:', notifResponse);
      DeviceEventEmitter.emit('notificationUpdated', {
        userId: data.notificationToProfileId,
        notifications: notifResponse,
      });
    }
  } catch (error) {
    console.error('Error in background message handler:', error);
  }
});

messaging().onMessage(async remoteMessage => {
  try {
    console.log("----------------------Received message -----------------------------\n", remoteMessage);
    const data = returnNotificationData(remoteMessage);
    console.log('Message handled in the foreground!', data);

    const shouldShow = await shouldDisplayNotification(data);
    if (!shouldShowNotification(data)) {
      console.log('Notification ignored because user is deleted');
      return;
    }

    if (!shouldShow) return;

    // Ensure event listeners are set up
    addRNCallEventListener();

    if (data?.actionType == 'VC') {
      displayIncomingCall(data);
      const notifResponse = await fetchNotification(data.notificationToProfileId);
      DeviceEventEmitter.emit('notificationUpdated', {
        userId: data.notificationToProfileId,
        notifications: notifResponse,
      });
    } else if (data?.actionType === 'M') {
      displayMessageNotification(data);
      const notifResponse = await fetchNotification(data.notificationToProfileId);
      DeviceEventEmitter.emit('notificationUpdated', {
        userId: data.notificationToProfileId,
        notifications: notifResponse,
      });
    } else {
      RNNotificationCall.declineCall(
        `${data?.notificationByProfileId}-${data?.notificationToProfileId}`,
      );
      const userId = data.notificationToProfileId;
      const notifResponse = await fetchNotification(data.notificationToProfileId);
      console.log(' Updated notifications:', notifResponse);
      DeviceEventEmitter.emit('notificationUpdated', {
        userId,
        notifications: notifResponse,
      });
    }
  } catch (error) {
    console.error('Error in foreground message handler:', error);
  }
});

// Initialize notification channels on app start (important for Android 14+)
if (Platform.OS === 'android') {
  configurePushNotifications();
  requestNotificationPermission();
}

console.log("ennnnnnnnd")

AppRegistry.registerComponent(appName, () => App);