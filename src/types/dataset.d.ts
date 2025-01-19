type Level = 'Level 1' | 'Level 2' | 'Level 3';
type Topic = 'ARITHMETIC' | 'ALGEBRA' | 'GEOMETRY' | 'STATISTICS' | 'PROBABILITY';

interface QuestionData {
  [key: `Q${number}`]: string;
  [key: `A${number}`]: string;
}

interface TopicData {
  [key in Level]: QuestionData[];
}

interface Dataset {
  [key in Topic]: TopicData;
}

declare const dataset: Dataset;
export default dataset;
