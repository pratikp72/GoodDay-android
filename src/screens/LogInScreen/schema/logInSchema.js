import * as yup from 'yup';

export const logInValidationSchema = yup.object().shape({
  email: yup
    .string()
    .email('Invalid email format')
    .required('Email is required')
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Invalid email format',
    )
    .max(255, 'Email must be at most 255 characters'),
  password: yup
    .string()
    // .min(6, 'Password must be at least 6 characters')
    // .matches(
    //   /.*[!@#$%^&*()\-_"=+{}; :,<.>].*/,
    //   'Password must contain at least one special character',
    // )
    .required('Password is required'),
});
