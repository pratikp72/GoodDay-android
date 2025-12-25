import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import React from 'react';
import {darkTheme, lightTheme} from '../theme/colors';

const SafeArea = ({
  children,
  customStyle,
  showDarkStatusBar = false,
  statusBarColor,
}) => {
  const theme = useColorScheme();
  const data = theme === 'light' ? lightTheme : darkTheme;
  const styles = style(data);
  return (
    <SafeAreaView style={[styles.safeArea, customStyle]}>
      <StatusBar
        animated={true}
        barStyle={'light-content'}
        backgroundColor={statusBarColor ? statusBarColor : null}
      />
      {children}
    </SafeAreaView>
  );
};

export default SafeArea;

const style = theme =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: 'white',
    },
  });
