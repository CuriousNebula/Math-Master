declare global {
  interface Question {
    text: string;
    answer: string;
    options: string[];
    topic: string;
  }

  interface Topic {
    name: string;
    displayName: string;
    color: string;
  }

  interface Dataset {
    [key: string]: {
      [level: string]: Array<{
        [key: string]: string;
      }>;
    };
  }
}

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.json' {
  const value: Dataset;
  export default value;
}

declare module 'react-confetti' {
  import { FC } from 'react';
  
  interface ConfettiProps {
    width?: number;
    height?: number;
    numberOfPieces?: number;
    recycle?: boolean;
    run?: boolean;
  }
  
  const Confetti: FC<ConfettiProps>;
  export default Confetti;
}

export {};
