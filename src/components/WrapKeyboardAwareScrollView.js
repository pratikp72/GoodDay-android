import {Keyboard, StyleSheet} from 'react-native';
import React, {useEffect, useState} from 'react';

import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useStyled} from '@gluestack-style/react';

const WrapKeyboardAwareScrollView = ({
  children,
  contentContainerStyle,
  isScrollable = false,
}) => {
  const theme = useStyled();
  const styles = style(theme.config.tokens);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true); // or some other action
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false); // or some other action
      },
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  return (
    <KeyboardAwareScrollView
      resetScrollToCoords={{x: 0, y: 0}}
      contentContainerStyle={[{flexGrow: 1}, contentContainerStyle]}
      bounces={false}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      scrollEnabled={isKeyboardVisible || isScrollable}>
      {children}
    </KeyboardAwareScrollView>
  );
};

export default WrapKeyboardAwareScrollView;

const style = theme =>
  StyleSheet.create({
    mainContainer: {},
  });
