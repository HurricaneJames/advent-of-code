import { dumpResult, getInput } from './Utils';

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
interface Cycle {
  size: number,
  value: string,
}
interface Window {
  min: number,
  max: number,
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
  // TODO - These required hand tuning to find,
  // future iteration should try to find the window automatically.
  const sampleWindow: Window = {min: 50, max: 60};
  const inputWindow: Window = {min: 2600, max: 2700};
  calc('Part 1 (sample)', processInput('sample'), sampleWindow, 2022, 3068);
  calc('Part 2 (sample)', processInput('sample'), sampleWindow, 1000000000000, 1514285714288);
  calc('Part 1', processInput(), inputWindow, 2022, 3102);
  calc('Part 2', processInput(), inputWindow, 1000000000000, 1539823008825);
}

function calc(description: string, jets: Jets, cycleWindow: Window, rocksToDrop: number, expected: number | null) {

  const state: State = {
    cavern: [],
    rock: -1,
    jet: 0,
  };

  let cycle: Cycle | null = null;
  let rocksAtCycleFound = 0;
  let heightAtLastCycle = -1;
  let heightOfCycles = 0;
  for (let i = 0; i < rocksToDrop; i++) {
    addNewRock(state);
    simulateRockDrop(state, jets);

    if (heightAtLastCycle > -1) continue;
    let foundCycle: Cycle | null;
    if ((foundCycle = findRepeatingWindow(cycleWindow, state, cycle)) != null) {
      if (cycle == null) {
        cycle = foundCycle;
        rocksAtCycleFound = i;
      } else {
        heightAtLastCycle = getRockHeight(state);
        const rocksPerCycle = i - rocksAtCycleFound;
        const remainingRocks = rocksToDrop - i;
        const remainingCyclesRaw = remainingRocks / rocksPerCycle;
        const remainingCycles = Math.floor(remainingCyclesRaw);
        const rocksInRemainingCycles = rocksPerCycle * remainingCycles;
        heightOfCycles = remainingCycles * foundCycle.size;
        const newI = i + rocksInRemainingCycles;
        i = newI;
      }
    }
  }

  const result = getRockHeight(state) + heightOfCycles;
  dumpResult(description, result, expected);
}

function findRepeatingWindow(cycleWindow: Window, state: State, previousCycle: Cycle | null): Cycle | null {
  const minHeight = 50 + 3 * cycleWindow.max;
  const rockHeight = getRockHeight(state);
  if (rockHeight < minHeight) return null;

  let minWindow = previousCycle?.size || cycleWindow.min;
  let maxWindow = previousCycle?.size || cycleWindow.max;

  const base = findTopRowIndex(state);
  const { cavern } = state;

  for (let window = minWindow; window <= maxWindow; window++) {
    const left = cavern.slice(base, base + window).map(lineSignature).join(' ');
    const middle = cavern.slice(base + window, base + 2 * window).map(lineSignature).join(' ');
    const right = previousCycle != null ? previousCycle.value : cavern.slice(base + 2 * window, base + 3 * window).map(lineSignature).join(' ');
    if (left === right && left === middle) {
      return { size: window, value: left };
    }
  }
  return null;
}

function lineSignature(line: Array<Cell>): number {
  return line.reduce((sum, i, idx) => i === Cell.FIXED ? sum + Math.pow(2, idx) : sum, 0);
}

function getRockHeight(state: State): number {
  return state.cavern.length - findTopRowIndex(state);
}

function findTopRowIndex(state: State): number {
  return state.cavern.findIndex(row => !row.every(c => c === Cell.EMPTY))
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
  return getInput(__filename, name).toString().split('').map(t => t === '>');
}

process();
