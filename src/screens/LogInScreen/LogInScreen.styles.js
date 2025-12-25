import {StyleSheet} from 'react-native';
import {moderateScale, scale, verticalScale} from '@constants/matrics';
import textStyles from '@constants/textTheme';

const style = theme =>
  StyleSheet.create({
    loginScreenContainer: {
      flex: 0.8,
      justifyContent: 'center',
    },
    welcomeText: {
      ...textStyles.headlineSmall,
      fontWeight: '700',
      color: theme.colors.textColor,
      marginBottom: verticalScale(10),
    },
    descText: {
      ...textStyles.bodySmall,
      color: theme.colors.textColor,
      marginBottom: verticalScale(18),
    },
    forgotPassword: {
      ...textStyles.lableMedium,
      color: theme.colors.basePrimary,
      textDecorationLine: 'underline',
      marginBottom: verticalScale(18),
    },
    inputContainer: {
      gap: verticalScale(4),
      marginBottom: verticalScale(16),
    },
    errorText: {
      color: '#FF0000',
      ...textStyles.textMedium,
    },
    errorDisplayContainer: {
      flexDirection: 'row',
      alignSelf: 'flex-start',
      alignItems: 'center',
    },
    signUpContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    registerText: {
      ...textStyles.labelLarge,
    },
    eyeIcon: {marginRight: verticalScale(8)},
  });
export default style;
