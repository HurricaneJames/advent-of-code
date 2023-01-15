import * as fs from 'fs';
import { dumpResult, findLastIndex, getResultMark } from './Utils';
import {getExpectedSampleStates} from './d23.sample.expect';

type Input = {
  positions: Tile[][],
};

export enum Direction {
  RIGHT = '>',
  DOWN = 'v',
  LEFT = '<',
  UP = '^',
  NONE = '*',
};
enum Tile {
  ELF = '#',
  EMPTY = '.',
}
export function isTile(t: string): t is Tile {
  return Object.values(Tile).includes(t as Tile);
}

type Point2 = {
  x: number,
  y: number,
}

export type State = {
  positions: Tile[][],
  directionList: Direction[],
}

const EXPECTED_SAMPLE_ITERATIONS = getExpectedSampleStates();
function calc(
  description: string,
  input: Input,
  expected: number | null,
  iterations: number | null,
) {
  const state = getInitialState(input);
  const result = iterations != null
    ? getEmptySpacesAfterFixedIterations(state, iterations)
    : getIterationsBeforeSpacedOut(state);
  dumpResult(description, result, expected);
}

function getEmptySpacesAfterFixedIterations(state: State, iterations: number): number {
  for (let i = 0; i < iterations; i++) {
    iterate(state, i, false);
  }
  const [min, max] = getBoundingRectangle(state);
  let sum = 0;
  for (let j = min.y; j <= max.y; j++) {
    for (let i = min.x; i <= max.x; i++) {
      if (state.positions[j][i] === Tile.EMPTY) sum++;
    }
  }
  return sum;
}

function getIterationsBeforeSpacedOut(state: State): number {
  const MAX_ITERATIONS = 100000;
  let iterations = 0;
  let shouldStop = false;
  while(iterations < MAX_ITERATIONS && !shouldStop) {
    const didAnybodyMove = iterate(state, iterations, false);
    shouldStop = !didAnybodyMove;
    iterations++;
  }
  if (!shouldStop) throw new Error('Probably have an error in algorithm');
  return iterations;
}

function iterate(state: State, iteration: number, shouldDebug: boolean): boolean {
  const { proposal, didAnybodyMove } = proposeMoves(state);
  state.positions = proposal.map(row => row.map(pt => pt.from != null ? Tile.ELF : Tile.EMPTY));
  state.directionList.push(...state.directionList.splice(0, 1))
  addNecessaryPadding(state);
  if (shouldDebug) {
    console.log('Iteration: ', iteration, didAnybodyMove);
    if (iteration < EXPECTED_SAMPLE_ITERATIONS.length) {
      compareState(state, EXPECTED_SAMPLE_ITERATIONS[iteration], true);
    } else {
      console.log(dumpState(state));
    }
  }

  return didAnybodyMove;
}

function getInitialState({ positions }: Input): State {
  const iState: State = {
    positions,
    directionList: [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT],
  };
  return addNecessaryPadding(iState);
}

function addNecessaryPadding(state: State): State {
  const { positions } = state;
  const oldMaxY = positions.length;
  const oldMaxX = positions[0].length;
  const [min, max] = getBoundingRectangle(state);
  if (min.x === 0) {
    positions.forEach(row => row.unshift(Tile.EMPTY));
  }
  if (max.x === oldMaxX - 1) {
    positions.forEach(row => row.push(Tile.EMPTY));
  }
  if (min.y === 0) {
    positions.unshift(new Array(positions[0].length).fill(Tile.EMPTY));
  }
  if (max.y === oldMaxY - 1) {
    positions.push(new Array(positions[0].length).fill(Tile.EMPTY));
  }
  return state;
}

function getBoundingRectangle(state: State): [Point2, Point2] {
  const { positions } = state;
  const size = { x: positions[0].length, y: positions.length };
  const min = { ...size };
  const max = { x: 0, y: 0 };
  min.y = positions.findIndex(row => !row.every(t => t === Tile.EMPTY));
  max.y = findLastIndex(positions, row => !row.every(t => t === Tile.EMPTY))
  for (let j = 0; j < size.y; j++) {
    const minx = positions[j].findIndex(t => t === Tile.ELF);
    if (minx > -1) min.x = Math.min(min.x, minx);
    max.x = Math.max(max.x, findLastIndex(positions[j], t => t === Tile.ELF));
  }
  return [min, max];
}

type Proposal = {
  from: Point2 | null,
  hasCollision: boolean,
}
type MovePlan = {
  proposal: Proposal[][],
  didAnybodyMove: boolean,
}
function proposeMoves(state: State): MovePlan {
  const { positions } = state;
  const columns = positions[0].length;
  const proposalMap: Proposal[][] = new Array(positions.length).fill(undefined).map(
    _ => new Array(columns).fill(undefined).map<Proposal>(_ => (
      { from: null, hasCollision: false }
    ))
  );
  let didAnybodyMove = false;
  positions.forEach((row, y) => row.forEach((tile, x) => {
    if (tile === Tile.EMPTY) return;
    const nextPosition: Point2 = findNextPosition(state, { x, y });
    const { x: nx, y: ny } = nextPosition;
    if (x !== nx || y !== ny) didAnybodyMove = true;
    const proposal = proposalMap[ny][nx];
    // not possible for anybody else to land on previously taken spot in this iteration
    if (proposal.hasCollision) {
      // already had a collision on the space, so stay in place
      proposalMap[y][x].from = { x, y };
    } else if (proposal.from == null) {
      // nothing in the space, try to take it
      proposal.from = { x, y };
    } else {
      // something in the space, move everybody back to original spaces and flag as unusable
      proposalMap[y][x].from = { x, y };
      const { x: ox, y: oy } = proposal.from;
      proposalMap[oy][ox].from = { x: ox, y: oy };
      proposal.from = null;
      proposal.hasCollision = true;
    }
  }));
  return {
    proposal: proposalMap,
    didAnybodyMove,
  };
}

function findNextPosition(state: State, from: Point2): Point2 {
  const direction: Direction = findDirection(state, from);
  const { x, y } = from;
  switch (direction) {
    case Direction.NONE:
      return from;
    case Direction.UP:
      return { x, y: y - 1 };
    case Direction.DOWN:
      return { x, y: y + 1 };
    case Direction.LEFT:
      return { x: x - 1, y };
    case Direction.RIGHT:
      return { x: x + 1, y };
  }
}

const DIRECTION_CELL_OFFSETS: Record<Direction, Point2[]> = {
  [Direction.UP]: [{ x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 }],
  [Direction.DOWN]: [{ x: -1, y: 1 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
  [Direction.LEFT]: [{ x: -1, y: -1 }, { x: -1, y: 0 }, { x: -1, y: 1 }],
  [Direction.RIGHT]: [{ x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 }],
  [Direction.NONE]: [], // invalid
}
const ALL_DIRECTION_OFFSETS: Point2[] = [
  { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },
  { x: -1, y: 0 }, { x: 1, y: 0 },
  { x: -1, y: 1 }, { x: 0, y: 1 }, { x: 1, y: 1 },
];
function findDirection(state: State, from: Point2): Direction {
  const { positions, directionList } = state;
  if (ALL_DIRECTION_OFFSETS.every(offset => positions[from.y + offset.y][from.x + offset.x] === Tile.EMPTY)) {
    return Direction.NONE;
  }
  const maxX = positions[0].length;
  const maxY = positions.length;
  const moveDirection = directionList.find(direction => {
    const offsets = DIRECTION_CELL_OFFSETS[direction];
    const testPoints = offsets
      .map(({ x, y }) => ({ x: from.x + x, y: from.y + y }))
      .filter(({ x, y }) => x >= 0 && y >= 0 && x < maxX && y < maxY);
    const isClear = testPoints.every(({ x, y }) => positions[y][x] === Tile.EMPTY);
    const result = testPoints.length > 0 && isClear;
    return result;
  });
  return moveDirection || Direction.NONE;
}


function processInput(name: string = 'input'): Input {
  const positions = fs.readFileSync(`./d23.${name}.txt`).toString().split('\n').map(line => line.split('').filter(isTile));
  return { positions };
}

function dumpState({ positions, directionList }: State) {
  const SEP = '\n----- ----- -----\n';
  return (
    SEP +
    'State: \n' +
    positions.map(row => row.join('')).join('\n') +
    SEP +
    directionList.join(', ') +
    SEP
  );
}

function compareState(a: State, b: State, showVerbose: boolean) {
  console.log('Compare States');
  if (b.positions.length === 0) return;
  const [minA, maxA] = getBoundingRectangle(a);
  const [minB, maxB] = getBoundingRectangle(b);
  const sizeA = { x: maxA.x - minA.x + 1, y: maxA.y - minA.y + 1 };
  const sizeB = { x: maxB.x - minB.x + 1, y: maxB.y - minB.y + 1 };
  const doSizesMatch = sizeA.x === sizeB.x && sizeA.y === sizeB.y;
  console.log('  Checking Size:', getResultMark(doSizesMatch, true));
  console.log('    A: [%o] = %o - %o', sizeA, maxA, minA);
  console.log('    B: [%o] = %o - %o', sizeB, maxB, minB);
  if (!doSizesMatch) return;

  let doPositionsMatch = true;
  let verboseOutput = ''
  for (let j = 0; j < sizeA.y; j++) {
    let isRowGood = true;
    for (let i = 0; i < sizeA.x; i++) {
      const aTile = a.positions[minA.y + j][minA.x + i];
      const bTile = b.positions[minB.y + j][minB.x + i];

      if (aTile !== bTile) { isRowGood = false; }
    }
    if (showVerbose) {
      verboseOutput += (
        '  ' +
        a.positions[minA.y + j].join('') +
        '    ' +
        b.positions[minB.y + j].join('') +
        getResultMark(isRowGood, true) +
        '\n'
      );
    }
    if (!isRowGood) doPositionsMatch = false;
  }
  console.log('  Checking Positions:', getResultMark(doPositionsMatch, true));
  if (showVerbose) { console.log(verboseOutput); }

  const doDirectionsMatch = a.directionList.reduce((res, dir, idx) => res && (dir === b.directionList[idx]), true)
  console.log('  Checking Directions:', getResultMark(doDirectionsMatch, true));
  if (showVerbose) {
    console.log('    a: ', a.directionList.join(', '));
    console.log('    b: ', b.directionList.join(', '));
  }
}

function process() {
  calc('Part 1 (sample)', processInput('sample'), 110, 10);
  calc('Part 1', processInput(), 4218, 10);
  calc('Part 2 (sample)', processInput('sample'), 20, null);
  calc('Part 2', processInput(), 976, null);
}
process();