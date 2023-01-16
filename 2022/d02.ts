import { dumpResult, getInput } from "./Utils";

const lose = 0;
const draw = 3;
const win = 6;
const shapeValue = {
  'X': 1, // rock
  'Y': 2, // paper
  'Z': 3, // scissors
  'A': 1, // rock
  'B': 2, // paper
  'C': 3, // scissors
};


(function process() {
  const score = getInput(__filename).split('\n').reduce((score: [number, number], val: string) => {
    const [op, me] = val.split(' ');
    score[0] += scoreRound(op, me);
    score[1] += scoreByStrategy(op, me);
    return score;
  }, [0, 0]);
  dumpResult("Part 1", score[0], 12535);
  dumpResult("Part 2", score[1], 15457);
})()

function scoreRound(opponent: string, me: string): number {
  // A/X/1 - rock 
  // B/Y/2 - paper
  // C/Z/3 - scissors
  switch (me) {
    case 'X':
      switch (opponent) {
        case 'A': return shapeValue[me] + draw;
        case 'B': return shapeValue[me] + lose;
        case 'C': return shapeValue[me] + win;
        default: throw new Error('input issue')
      }
    case 'Y':
      switch (opponent) {
        case 'A': return shapeValue[me] + win;
        case 'B': return shapeValue[me] + draw;
        case 'C': return shapeValue[me] + lose;
        default: throw new Error('input issue')
      }
    case 'Z':
      switch (opponent) {
        case 'A': return shapeValue[me] + lose;
        case 'B': return shapeValue[me] + win;
        case 'C': return shapeValue[me] + draw;
        default: throw new Error('input issue')
      }
    default: throw new Error('input issue')
  }
}

function scoreByStrategy(opponent: string, goal: string): number {
  const myPlay: {[id: string]: {[id: string]: 'A' | 'B' | 'C'}} = {
    // maps myPlay[strategy][opponent] => myPlay to get the strategy
    'X': {
      // to lose
      'A': 'C',
      'B': 'A',
      'C': 'B',
    },
    'Y': {
      // to draw
      'A': 'A',
      'B': 'B',
      'C': 'C',
    },
    'Z': {
      // to win
      'A': 'B',
      'B': 'C',
      'C': 'A',
    },
  };
  // A/X/1 - rock 
  // B/Y/2 - paper
  // C/Z/3 - scissors
  if (opponent !== 'A' && opponent !== 'B' && opponent !== 'C') {
    throw new Error('input issue');
  }
  switch (goal) {
    case 'X': // lose
      return shapeValue[myPlay.X[opponent]] + lose;
    case 'Y': // draw
      return shapeValue[myPlay.Y[opponent]] + draw;
    case 'Z': // win
      return shapeValue[myPlay.Z[opponent]] + win;
    default: throw new Error('input issue')
  }
}