/* eslint-disable react-native/no-inline-styles */
import {Text, View, TouchableOpacity, Platform} from 'react-native';
import React, {useState} from 'react';
import style from './LogInScreen.styles';

import CustomButton from '../../components/CustomButton';
import SafeArea from '../../components/SafeArea';
import {Formik} from 'formik';
import {useLogIn} from './hook';
// import OpenEye from '@assets/Images/open_eye.svg';
// import CloseEye from '@assets/Images/close_eye.svg';
import {useSelector} from 'react-redux';
import WraperComponent from '../../components/WraperComponent';
import WrapKeyboardAwareScrollView from '../../components/WrapKeyboardAwareScrollView';
import {
  AlertCircleIcon,
  EyeIcon,
  EyeOffIcon,
  Icon,
  Input,
  InputField,
  useStyled,
} from '@gluestack-ui/themed';
import GlobalString from '../../constants/string';
import {inputSize, moderateScale, verticalScale} from '../../constants/matrics';

const LogInScreen = ({navigation}) => {
  const styled = useStyled();
  const theme = styled.config.tokens;
  const styles = style(theme);

  const {handleLogIn, logInInitialValues, logInValidationSchema} = useLogIn();
  const {loading} = useSelector(state => state.auth);

  const [show, setShow] = useState(false);

  return (
    <SafeArea
      customStyle={{backgroundColor: theme.colors.backgroundColor}}
      statusBarColor={'white'}
      showDarkStatusBar={true}>
      <WraperComponent>
        <WrapKeyboardAwareScrollView>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
            }}>
            <Formik
              validationSchema={logInValidationSchema}
              enableReinitialize
              initialValues={logInInitialValues}
              onSubmit={handleLogIn}>
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                isValid,
                setFieldValue,
                touched,
              }) => (
                <>
                  <View style={styles.loginScreenContainer}>
                    <Text style={styles.welcomeText}>
                      {GlobalString.WELCOME_BACK}
                    </Text>
                    <Text style={styles.descText}>
                      {GlobalString.PLEASE_LOGIN_TO_CONTINUE_TO_THE_APP}
                    </Text>

                    <View style={styles.inputContainer}>
                      <Input
                        borderRadius={verticalScale(8)}
                        height={verticalScale(50)}>
                        <InputField
                          width="100%"
                          onChangeText={handleChange('email')}
                          onBlur={handleBlur('email')}
                          value={values.email}
                          focusOutlineColor={theme.colors.basePrimary}
                          autoCapitalize="none"
                          keyboardType="email-address"
                          autoCorrect={false}
                          backgroundColor="#e8f0fe"
                          placeholder={GlobalString.EMAIL_ADDRESS}
                          paddingHorizontal={'$3'}
                          fontSize={moderateScale(16)}
                          _focus={{
                            selectionColor: theme.colors.primary[700],
                            cursorColor: theme.colors.textColor,
                          }}
                        />
                      </Input>
                      {errors.email && touched.email && (
                        <View style={styles.errorDisplayContainer}>
                          <Icon
                            as={AlertCircleIcon}
                            mr="$2"
                            w="$4"
                            h="$4"
                            color="#FF0000"
                          />
                          <Text style={styles.errorText}>{errors.email}</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.inputContainer}>
                      <Input
                        borderRadius={verticalScale(8)}
                        height={verticalScale(50)}>
                        <InputField
                          width="100%"
                          py={Platform.OS === 'ios' ? 4 : inputSize.size}
                          onChangeText={handleChange('password')}
                          onBlur={handleBlur('password')}
                          value={values.password}
                          type={show ? 'text' : 'password'}
                          focusOutlineColor={theme.colors.basePrimary}
                          autoCapitalize="none"
                          autoCorrect={false}
                          paddingHorizontal={'$3'}
                          backgroundColor="#e8f0fe"
                          placeholder={GlobalString.PASSWORD}
                          fontSize={moderateScale(16)}
                          // InputRightElement={
                          //   <>
                          //     {!show ? (
                          //       <TouchableOpacity
                          //         onPress={() => setShow(!show)}
                          //         style={styles.eyeIcon}>
                          //         <Icon as={EyeOffIcon} m="$2" w="$4" h="$4" />
                          //       </TouchableOpacity>
                          //     ) : (
                          //       <TouchableOpacity
                          //         onPress={() => setShow(!show)}
                          //         style={styles.eyeIcon}>
                          //         <Icon as={EyeIcon} m="$2" w="$4" h="$4" />
                          //       </TouchableOpacity>
                          //     )}
                          //   </>
                          // }
                          _focus={{
                            selectionColor: theme.colors.primary[700],
                            cursorColor: theme.colors.textColor,
                          }}
                        />
                      </Input>
                      {errors.password && touched.password && (
                        <View style={styles.errorDisplayContainer}>
                          <Icon
                            as={AlertCircleIcon}
                            mr="$2"
                            w="$4"
                            h="$4"
                            color="#FF0000"
                          />
                          <Text style={styles.errorText}>
                            {errors.password}
                          </Text>
                        </View>
                      )}
                    </View>
                    {/* 
                    <TouchableOpacity
                      onPress={() => {
                        navigation.navigate('ResetPasswordScreen');
                      }}
                      style={{alignSelf: 'flex-end'}}>
                      <Text style={styles.forgotPassword}>
                        {GlobalString.FORGOT_PASSWORD}
                      </Text>
                    </TouchableOpacity> */}
                    <CustomButton
                      title={GlobalString.LOGIN}
                      onPress={handleSubmit}
                      isLoading={loading}
                    />
                  </View>
                </>
              )}
            </Formik>
          </View>
          {/* <View style={styles.signUpContainer}>
            <Text style={styles.registerText}>New to Cindle Logistics? </Text>
            <TouchableOpacity
              onPress={() => {
                navigation.replace('SignUpScreen');
              }}>
              <Text
                style={[
                  styles.registerText,
                  {color: theme.colors.basePrimary, fontWeight: '700'},
                ]}>
                SignUp
              </Text>
            </TouchableOpacity>
          </View> */}
        </WrapKeyboardAwareScrollView>
      </WraperComponent>
    </SafeArea>
  );
};

export default LogInScreen;
