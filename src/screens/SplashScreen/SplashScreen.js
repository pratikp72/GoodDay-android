import React, {useEffect, useRef} from 'react';
import {
  Text,
  SafeAreaView,
  StatusBar,
  useColorScheme,
  Dimensions,
  Animated,
  Image,
  Easing,
} from 'react-native';
import style from './SplashScreen.styles';

const {width, height} = Dimensions.get('window');

const SplashScreen = () => {
  const styles = style();
  const colorScheme = useColorScheme();

  const fade = useRef(new Animated.Value(0)).current;
  const rotateX = useRef(new Animated.Value(0)).current;
  const rotateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fadeAnimation = Animated.timing(fade, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    });

    const rotationAnimation = Animated.loop(
      Animated.parallel([
        Animated.timing(rotateX, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(rotateY, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    );

    fadeAnimation.start();
    rotationAnimation.start();

    return () => {
      fadeAnimation.stop();
      rotationAnimation.stop();
    };
  }, []);

  const spinY = rotateY.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <StatusBar
        animated={true}
        backgroundColor={colorScheme === 'dark' ? '#212f48' : '#212f48'}
        barStyle={'light-content'}
      />
      <Animated.Image
        source={require('../../../assets/Images/logo.jpg')}
        style={[
          styles.logo,
          {
            transform: [{rotateY: spinY}],
          },
        ]}
      />
      <Animated.Text style={[styles.app_name, {opacity: fade}]}>
        EE2E App
      </Animated.Text>
    </SafeAreaView>
  );
};

export default SplashScreen;
