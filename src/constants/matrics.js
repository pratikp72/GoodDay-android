import React from 'react';
import {Dimensions, View, PixelRatio} from 'react-native';
const {width, height} = Dimensions.get('window');

//Guideline sizes are based on standard ~5" screen mobile device
// const guidelineBaseWidth = Platform.OS === 'android' ? 400 : 350;
// const guidelineBaseHeight = Platform.OS === 'android' ? 630 : 680;

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

// const widthBaseScale = SCREEN_WIDTH / 375;
// const heightBaseScale = SCREEN_HEIGHT / 812;

// function normalize(size, based = 'width') {
//   const newSize =
//     based === 'height' ? size * heightBaseScale : size * widthBaseScale;
//   return Math.round(PixelRatio.roundToNearestPixel(newSize));
// }

const scale = size =>
  Math.round(PixelRatio.roundToNearestPixel(width / guidelineBaseWidth) * size);

const verticalScale = size =>
  Math.round(
    PixelRatio.roundToNearestPixel((height / guidelineBaseHeight) * size),
  );

// const moderateScale = (size, factor = 0.5) =>
//   Math.round(
//     PixelRatio.roundToNearestPixel(size + (scale(size) - size) * factor),
//   );
const moderateScale = (size, factor = 0.5) =>
  Math.round(
    PixelRatio.roundToNearestPixel((height / guidelineBaseHeight) * size),
  );

export const inputSize = {
  size:
    height <= 480
      ? 1
      : height > 480 && height <= 600
      ? 2
      : height > 600 && height <= 840
      ? 3
      : 4,
};

// const noramalFont = {
//   fontWeight: 'bold',
//   fontSize: normalizeFontSize.smallBig,
// };

const emptyView = h => {
  return <View style={{height: moderateScale(h)}} />;
};

export {
  scale,
  verticalScale,
  moderateScale,
  // noramalFont,
  emptyView,
};
