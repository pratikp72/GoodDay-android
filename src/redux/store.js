import {configureStore} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  createTransform,
} from 'redux-persist';
import authSlice from './store/auth/authSlice';
import scannerSlice from './store/scanner/scannerSlice';

// Define a transform to only persist the 'token' property
const authTransform = createTransform(
  (inboundState, key) => {
    return {...inboundState, token: inboundState.token};
  },
  (outboundState, key) => {
    return {...outboundState, token: outboundState.token};
  },
  {whitelist: ['auth']},
);

// Define which parts of the state to persist and apply the transform

const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
};

const scannerPersistConfig = {
  key: 'scanner',
  storage: AsyncStorage,
};

const authPersistedReducer = persistReducer(authPersistConfig, authSlice);
const scannerPersistedReducer = persistReducer(scannerPersistConfig, scannerSlice);

export const store = configureStore({
  reducer: {
    auth: authPersistedReducer,
    scanner: scannerPersistedReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
