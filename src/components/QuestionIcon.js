import React from 'react';
import Svg, {Circle, Path, Line} from 'react-native-svg';

export const QuestionIcon = (props: any) => (
  <Svg
    width={24}
    height={27}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}>
    <Path d="M9.09 9a3 3 0 1 1 5.83 1c0 2-3 3-3 6" />
    <Line x1={12} y1={20} x2={12.5} y2={20} />
  </Svg>
);
