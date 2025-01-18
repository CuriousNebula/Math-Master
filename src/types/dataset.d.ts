declare module '*.json' {
  const value: {
    [topic: string]: {
      [level: string]: Array<{
        [key: string]: string;
      }>;
    };
  };
  export default value;
}
