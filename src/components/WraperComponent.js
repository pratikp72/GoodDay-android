import {StyleSheet, useColorScheme, View} from 'react-native';
import React from 'react';
import {verticalScale} from '@constants/matrics';
import {darkTheme, lightTheme} from '../theme/colors';

const WraperComponent = ({children, customStyle}) => {
  const theme = useColorScheme();
  const data = theme === 'light' ? lightTheme : darkTheme;
  const styles = style(data);
  return <View style={[styles.mainContainer, customStyle]}>{children}</View>;
};

export default WraperComponent;

const style = theme =>
  StyleSheet.create({
    mainContainer: {
      flex: 1,
      width: '90%',
      marginBottom: verticalScale(10),
      paddingTop: verticalScale(10),
      alignSelf: 'center',
    },
  });
