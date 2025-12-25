import {StyleSheet, useColorScheme} from 'react-native';
import {darkTheme, lightTheme} from '../../theme/colors';
import textStyles from '../../constants/textTheme';
import {verticalScale} from '../../constants/matrics';

const style = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const colorScheme = useColorScheme();
  return StyleSheet.create({
    safeAreaView: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: darkTheme.colors.basePrimary,

      paddingTop: verticalScale(10),
      paddingBottom: verticalScale(10),
      gap: verticalScale(20),
    },
    logo: {
      justifyContent: 'center',
      borderRadius: 100,
      borderWidth: 1,
      borderColor: 'black',
      width: 80,
      height: 80,
      resizeMode: 'cover',
    },
    app_name: {
      width: '90%',
      flexWrap: 'wrap',
      textAlign: 'center',
      ...textStyles.headlineLarge,
      color: 'white',
    },
  });
};
export default style;
