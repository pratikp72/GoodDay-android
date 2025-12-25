module.exports = {
  // presets: ['module:@react-native/babel-preset'],
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    // ... other configs, if any
    [
      'module-resolver',
      {
        extensions: [
          '.ios.js',
          '.android.js',
          '.ios.jsx',
          '.android.jsx',
          '.js',
          '.jsx',
          '.json',
          '.ts',
          '.tsx',
        ],
        root: ['.'],
        alias: {
          '@assets': './assets',
          '@components': './src/components',
          '@screens': './src/screens',
          '@constants': './src/constants',
        },
      },
    ],
    'react-native-reanimated/plugin',

    // ... other configs, if any
  ],
};

