import {logInValidationSchema} from '../schema';
import {useDispatch} from 'react-redux';

import {useToastMessage} from '../../../hooks/useToastMessage';
import {loginThunk} from '../../../redux/store/auth/authAction';
export const useLogIn = () => {
  const dispatch = useDispatch();
  const {showToast} = useToastMessage();

  const logInInitialValues = {
    email: '',
    password: '',
  };

  const handleLogIn = async values => {
    try {
      const payload = {
        email: values.email.trim(),
        password: values.password.trim(),
      };

      const response = await dispatch(loginThunk(payload));

      console.log('response.payload', response);

      if (response.payload?.success) {
        showToast({message: response.payload.message});
      } else if (response.payload?.message) {
        showToast({message: response.payload.message});
      } else if (response.payload) {
        showToast({message: response.payload});
      }
    } catch (error) {
      console.log(error);
      console.log(error?.response?.data?.message);
      showToast({message: error?.response?.data?.message});
    }
  };

  return {logInValidationSchema, logInInitialValues, handleLogIn};
};
