declare module 'react-native-slider' {
  import { Component } from 'react';
  import { ViewStyle } from 'react-native';
  export interface SliderProps {
    value?: number;
    minimumValue?: number;
    maximumValue?: number;
    step?: number;
    onValueChange?: (value: number) => void;
    style?: ViewStyle;
  }
  export default class Slider extends Component<SliderProps> {}
}
