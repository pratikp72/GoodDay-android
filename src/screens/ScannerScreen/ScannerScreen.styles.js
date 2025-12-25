import {Platform, StyleSheet, useColorScheme} from 'react-native';
import {darkTheme, lightTheme} from '../../theme/colors';
import textStyles from '../../constants/textTheme';
import {moderateScale, scale, verticalScale} from '../../constants/matrics';

const style = theme => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return StyleSheet.create({
    scannerContainer: {
      flex: 1,
    },

    modalOverlay: {
  ...StyleSheet.absoluteFillObject,
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 999,
},

successModal: {
  width: '85%',
  paddingVertical: verticalScale(30),
  paddingHorizontal: moderateScale(20),
  backgroundColor: '#fff',
  borderRadius: moderateScale(16),
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 8,
  elevation: 8,
},

closeIcon: {
  position: 'absolute',
  top: moderateScale(15),
  right: moderateScale(15),
  color: '#666',
  fontSize: moderateScale(22),
},

modalTitle: {
  fontSize: moderateScale(18),
  fontWeight: '700',
  color: '#222',
  textAlign: 'center',
  marginTop: verticalScale(10),
  marginBottom: verticalScale(10),
},

modalSubtitle: {
  fontSize: moderateScale(14),
  color: '#555',
  textAlign: 'center',
  lineHeight: 20,
  marginBottom: verticalScale(25),
},

okButton: {
  width: '70%',
  borderRadius: moderateScale(10),
  backgroundColor:'#212f48',
  alignSelf: 'center',
},

okButtonText: {
  color: '#fff',
  fontWeight: '600',
  fontSize: moderateScale(16),
},

    headerContainer: {
      backgroundColor: '#212f48',
      width: '100%',
      paddingHorizontal: '5%',
      paddingTop: Platform.OS === 'ios' ? 40 : 0,
      paddingBottom: Platform.OS === 'ios' ? 20 : 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: scale(20),
    },
    headerText: {
      ...textStyles.headlineSmall,
      color: 'white',
      marginTop: 10,
    },
    noCameraText: {
      ...textStyles.bodyLarge,
      color: theme.colors.basePrimary,
    },
    backIcon: {
      color: 'white',
      width: scale(20),
      height: scale(20),
      marginTop: 10,
    },
    cameraContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
  });
};
export default style;
