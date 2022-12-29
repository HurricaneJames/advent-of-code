import * as fs from 'fs';

// '<' -> false,   '>' -> true
type Jets = Array<boolean>;

enum Cell {
  EMPTY = '.',
  FIXED = '#',
  FALLING = '@',
};
type Cavern = Array<Array<Cell>>;
type Shape = {
  height: number,
  rock: Array<Array<boolean>>
}
type Position = { x: number, y: number };
interface State {
  cavern: Cavern;
  rock: number;
  jet: number;
}

const CAVERN_WIDTH = 7;
const EMPTY_ROWS_ABOVE_LAST_ROCK = 3;

const SHAPES: Array<Shape> = [
  [[1, 1, 1, 1]],
  [
    [0, 1, 0],
    [1, 1, 1],
    [0, 1, 0],
  ],
  [
    [0, 0, 1],
    [0, 0, 1],
    [1, 1, 1],
  ],
  [
    [1],
    [1],
    [1],
    [1],
  ],
  [
    [1, 1],
    [1, 1],
  ]
].map(s => ({
  height: s.length,
  rock: s.map(r => r.map(c => !!c)),
}));

function process() {
  calc('Part 1 (sample)', processInput('sample'), 2022, 3068);
  calc('Part 1', processInput(), 2022, 3102);
}

function calc(description: string, jets: Jets, rocksToDrop: number, expected: number | null) {

  const state: State = {
    cavern: [],
    rock: -1,
    jet: 0,
  };

  const SIGNATURE_LINES = 5;
  for (let i = 0; i < rocksToDrop; i++) {
    addNewRock(state);
    simulateRockDrop(state, jets);
  }

  const result = findTopRow(state);
  let resultMark = expected == null
    ? '❓'
    : ((result === expected)
      ? '✅'
      : '❌'
    );

  console.log(
    '%s (%s): got %d / expected %d',
    description,
    resultMark,
    result,
    expected,
  );
}

function findTopRow(state: State): number {
  return state.cavern.length - state.cavern.findIndex(row => !row.every(c => c === Cell.EMPTY));
}

function dump(state: State, showLines: boolean = false) {
  return state.cavern.map(
    (row, idx) => ((showLines ? ("000" + idx + ': ').slice(-5) : '') + row.join(''))
  ).join('\n');
}

function simulateRockDrop(state: State, jets: Jets) {
  const { cavern, rock, jet: initJet } = state;
  const rockShape = SHAPES[rock];
  let stillFalling = true;
  let lastPosition = { x: 2, y: 0 };
  let nextJet = initJet;
  while (stillFalling) {
    const newPosition = simulateIteration(
      cavern,
      jets,
      rockShape,
      lastPosition,
      nextJet,
    );
    stillFalling = (newPosition.y !== lastPosition.y);
    lastPosition = newPosition;
    nextJet = (nextJet + 1) % jets.length;
  }

  cementRockInPlace(cavern, rockShape, lastPosition);

  state.jet = nextJet;
}

function simulateIteration(
  stack: Cavern,
  jets: Jets,
  rock: Shape,
  { x, y }: Position, // top-left position of falling rock
  windDirectionIdx: number,
): Position {
  let newY = y;
  let newX = x;

  const canMoveHorizontal = rock.rock.every((rockRow, idx) => {
    const stackRowIdx = y + idx;
    if (jets[windDirectionIdx]) {
      // right
      if (x + rockRow.length >= CAVERN_WIDTH) return false;
      const rightMostRockPartInRow = rockRow.reduce((max, x, idx) => (x ? idx : max), 0);
      return stack[stackRowIdx][x + rightMostRockPartInRow + 1] === Cell.EMPTY;
    } else {
      // left
      if (x <= 0) return false;
      const leftMostRockPartInRow = rockRow.findIndex(x => x);
      return stack[stackRowIdx][x + leftMostRockPartInRow - 1] === Cell.EMPTY;
    }
  });
  if (canMoveHorizontal) newX += jets[windDirectionIdx] ? 1 : -1;

  const hasHitBottom = ((newY + rock.height) >= stack.length)

  const canMoveVertical = !hasHitBottom && rock.rock.every((rockRow, rIdx) => {
    return rockRow.every((cell, cIdx) => {
      return (!cell || (stack[y + rIdx + 1][newX + cIdx] === Cell.EMPTY))
    })
  });
  if (canMoveVertical) newY++;

  return { x: newX, y: newY };
}

function showFallingRockInPlace(state: State, rockShape: Shape, pos: Position): State {
  let newCavern = state.cavern.slice().map(row => row.slice());
  cementRockInPlace(newCavern, rockShape, pos, Cell.FALLING);
  return {
    ...state,
    cavern: newCavern,
  };
}

function cementRockInPlace(cavern: Cavern, rockShape: Shape, pos: Position, rockType: Cell = Cell.FIXED) {
  for (let y = 0; y < rockShape.height; y++) {
    for (let x = 0; x < rockShape.rock[0].length; x++) {
      if (rockShape.rock[y][x]) {
        cavern[pos.y + y][pos.x + x] = rockType;
      }
    }
  }
}

function countEmptyRowsAtTop(stack: Cavern): number {
  let stillEmpty = true;
  let i = 0;
  while (stillEmpty && i < stack.length) {
    if (!stack[i].every(s => s === Cell.EMPTY)) {
      stillEmpty = false;
      return i;
    } else {
      i++
    }
  }
  return i;
}

function addNewRows(stack: Cavern, count: number) {
  if (count > 0) {
    for (let i = 0; i < count; i++) {
      stack.unshift(new Array(CAVERN_WIDTH).fill(Cell.EMPTY));
    }
  } else {
    for (let i = 0; i < -count; i++) {
      stack.shift();
    }
  }
}

function addNewRock(state: State): State {
  state.rock = (state.rock + 1) % SHAPES.length;
  const shape = SHAPES[state.rock];
  const emptyRows = countEmptyRowsAtTop(state.cavern);
  const newRowsRequired = shape.height + EMPTY_ROWS_ABOVE_LAST_ROCK - emptyRows;
  addNewRows(state.cavern, newRowsRequired);

  return state;
}

function processInput(name: string = 'input'): Jets {
  return fs.readFileSync(`./d17.${name}.txt`).toString().split('').map(t => t === '>');
}

process();
