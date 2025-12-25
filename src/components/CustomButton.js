import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableHighlight,
} from 'react-native';
import React from 'react';
import {verticalScale} from '../constants/matrics';
import textStyles from '../constants/textTheme';
import {useStyled} from '@gluestack-style/react';
const CustomButton = ({
  title,
  onPress,
  buttonStyle,
  textStyle,
  underlayColor,
  isLoading,
  disabled,
}) => {
  const styled = useStyled();
  const theme = styled.config.tokens;
  const styles = style(theme);
  return (
    <TouchableHighlight
      onPress={onPress}
      style={[styles.button, buttonStyle, disabled && {opacity: 0.5}]}
      disabled={isLoading || disabled}
      underlayColor={underlayColor ? underlayColor : theme.colors.basePrimary}>
      {isLoading ? (
        <ActivityIndicator color={theme.colors.neutral[25]} />
      ) : (
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      )}
    </TouchableHighlight>
  );
};

export default CustomButton;

const style = theme =>
  StyleSheet.create({
    button: {
      borderRadius: verticalScale(8),
      backgroundColor: theme.colors.basePrimary,
      width: '100%',
      padding: verticalScale(15),
    },
    buttonText: {
      color: 'white',
      ...textStyles.bodySmall,
      textAlign: 'center',
      fontWeight: '500',
    },
  });
