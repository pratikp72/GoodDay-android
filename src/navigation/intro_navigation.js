/* eslint-disable react/react-in-jsx-scope */
import {createStackNavigator} from '@react-navigation/stack';
import FeaturesScreen from '../screens/FeaturesScreen/FeaturesScreen';

const Stack = createStackNavigator();

const IntroNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName={'FeaturesScreen'}
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="FeaturesScreen" component={FeaturesScreen} />
    </Stack.Navigator>
  );
};

export default IntroNavigator;
