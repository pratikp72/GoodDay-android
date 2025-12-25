/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import LogInScreen from '../screens/LogInScreen/LogInScreen';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName={'LogInScreen'}
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="LogInScreen" component={LogInScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
