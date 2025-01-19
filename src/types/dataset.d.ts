interface QuestionItem {
  [key: string]: string;
}

interface LevelQuestions {
  [key: string]: QuestionItem;
}

interface TopicLevels {
  "Level 1": LevelQuestions[];
  "Level 2": LevelQuestions[];
  "Level 3": LevelQuestions[];
}

interface Dataset {
  ARITHMETIC: TopicLevels;
  ALGEBRA: TopicLevels;
  PROBABILITY: TopicLevels;
  STATISTICS: TopicLevels;
  GEOMETRY: TopicLevels;
  [key: string]: TopicLevels;
}

declare module '*.json' {
  const dataset: Dataset;
  export default dataset;
}
