import {Platform, StyleSheet, useColorScheme} from 'react-native';
import {darkTheme, lightTheme} from '../../theme/colors';
import textStyles from '../../constants/textTheme';
import {scale, verticalScale} from '../../constants/matrics';

const style = theme => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: theme?.colors?.backgroundColor,
      paddingBottom: 20,
    },
   
    headerContainer: {
      backgroundColor: '#212f48',
      width: '100%',
      justifyContent: 'center',
      paddingHorizontal: '5%',
      paddingTop: Platform.OS === 'ios' ? 40 : 0,
      paddingBottom: Platform.OS === 'ios' ? 20 : 10,
      flexDirection: 'row',
    },
    headerText: {
      ...textStyles.headlineSmall,
      color: 'white',
      marginTop: 10,
      flex: 1,
    },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap:50,


  },

  logoImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 2,
    justifyContent:"center",
    alignItems:"center",
    borderColor: '#d1d5db', // subtle gray border
  },
 headingText: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 25,
    color: '#212f48', // dark blue text
  },
   plusButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: '#ae3535ff', // red/pink accent color
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  plusIcon: {
    width: 30,
    height: 30,
    color: '#fff', // white icon
    justifyContent:"center",
    alignItems:"center",
    
  },

plusOther:{
     color: 'white',
      width: scale(20),
      height: scale(20),
      marginTop: 10,
    },
  instructionsContainer: {
    alignSelf: 'stretch',
    paddingHorizontal: 10,
  },
  instructionText: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 22,
    color:"black"
  },
    
    noData: {
      ...textStyles.bodyMedium,
      color: 'black',
      alignSelf: 'center',
    },
    cameraContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scannedDataContainer: {
      flex: 1,
      backgroundColor: theme?.colors?.cardColor,
      padding: scale(15),
      margin: scale(10),
  
      
      borderRadius: scale(10),
      alignItems: 'center',
      justifyContent: 'center',
      gap: scale(10),
    },

  
    scannedData: {
      ...textStyles.bodyMedium,
      color: 'white',
    },
    noDataContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    noDataText: {
      ...textStyles.bodySmall,
      color: theme.colors.textColor,
      marginTop: verticalScale(10),
      textAlign: 'center',
      width: '90%',
    },
    notificationText: {
      ...textStyles.bodyMedium,
      color: theme.colors.textColor,
      fontWeight: '700',
    },
    scannedImage: {
      width: 50,
      height: 50,
      borderRadius: 100,
      borderWidth: 1,
      borderColor: theme.colors.basePrimary,
      resizeMode: 'cover',
    },
    scannedText: {
      ...textStyles.bodyMedium,
      color: theme.colors.textColor,
      
    },
    noteText: {
      ...textStyles.bodySmall,
      color: 'red',
      width: '90%',
      textAlign: 'center',
    },
    msgText: {
      ...textStyles.bodyMedium,
      color: theme.colors.basePrimary,
      width: '80%',
      textAlign: 'left',
    },
    deleteIcon: {
      position: 'absolute',
      top: 8,
      right: 8,
    },
    successText: {
      ...textStyles.bodySmall,
      fontSize:15,
      color: theme.colors.basePrimary,
      textAlign: 'center',

    },
    successContainer: {
      flex: 1,
      width: '80%',
      marginBottom: 20,
      alignSelf: 'center',
      justifyContent: 'flex-end',
    },
    logoImage: {
      width: 100,
      height: 100,
    },
    // emptyContainer: {
    //   marginVertical: 20,
    //   paddingHorizontal: '5%',
    // },
    textStyle:{
       ...textStyles.bodySmall,
      color: theme.colors.textColor,
      
    },switchContainer: {

    width:36,
    height: 19,
    borderRadius: 25,
    padding: 3,
  },
  switchCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  });
};
export default style;
