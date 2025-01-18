declare module 'react-confetti' {
  import { Component } from 'react';

  interface ConfettiProps {
    width?: number;
    height?: number;
    numberOfPieces?: number;
    recycle?: boolean;
    run?: boolean;
  }

  export default class Confetti extends Component<ConfettiProps> {}
}
