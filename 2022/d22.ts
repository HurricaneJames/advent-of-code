import { dumpResult, getInput, modulo } from './Utils';

type Input = {
  map: Tile[][][],
  layout: Layout,
  instructions: Instruction[],
};

enum InstructionDirection {
  LEFT = 'L',
  RIGHT = 'R',
}
type Instruction = number | InstructionDirection;
function isInstructionDirection(t: string): t is InstructionDirection {
  return Object.values(InstructionDirection).includes(t as InstructionDirection);
}

enum Tile {
  OPEN = '.',
  SOLID = '#',
  NONE = ' ',
  UP = '^',
  DOWN = 'v',
  LEFT = '<',
  RIGHT = '>',
};
function isTile(t: string): t is Tile {
  return Object.values(Tile).includes(t as Tile);
}
enum Direction {
  RIGHT = 0,
  DOWN = 1,
  LEFT = 2,
  UP = 3,
};

const TileDirectionMap: Record<Direction, Tile> = {
  [Direction.UP]: Tile.UP,
  [Direction.DOWN]: Tile.DOWN,
  [Direction.LEFT]: Tile.LEFT,
  [Direction.RIGHT]: Tile.RIGHT,
};

type Point2 = {
  x: number,
  y: number,
}

type Cursor = {
  face: number,
  pos: Point2,
  dir: Direction,
}

type Layout = number[][];

type State = {
  map: Tile[][][],    // Tile[face][x][y]
  layout: Layout,
  cubeMap: CubeMap,
  sideLength: number  // the number of rows/colums on a face side
  cursor: Cursor,
};

const DIR_OFFSETS: Record<Direction, Point2> = {
  [Direction.RIGHT]: { x: 1, y: 0 },
  [Direction.DOWN]: { x: 0, y: 1 },
  [Direction.LEFT]: { x: -1, y: 0 },
  [Direction.UP]: { x: 0, y: -1 },
};

function process() {
  calc('Part 1 (sample)', processInput('sample'), 6032, 'part1', 'sample');
  calc('Part 1', processInput(), 190066, 'part1', 'input');
  calc('Part 2 (sample)', processInput('sample'), 5031, 'part2', 'sample');
  calc('Part 2', processInput(), 134170, 'part2', 'input');
}

const ROW_MULTIPLY = 1000;
const COL_MULTIPLY = 4;

function calc(
  description: string,
  { map, layout, instructions }: Input,
  expected: number | null,
  part: 'part1' | 'part2', input: 'sample' | 'input'
) {
  const initialState = getInitialState(map, layout, part, input);
  const state = walkWithWrapping(instructions, initialState);
  const pos = mapFacePositionToOriginalInputPosition(state);
  const result = (pos.y + 1) * ROW_MULTIPLY + (pos.x + 1) * COL_MULTIPLY + state.cursor.dir;
  dumpResult(description, result, expected);
}

function mapFacePositionToOriginalInputPosition(state: State): Point2 {
  const { face, pos } = state.cursor;
  const base = getBaseForTile(state, face);
  return { x: base.x + pos.x, y: base.y + pos.y };
}

function getBaseForTile(state: State, face: number): Point2 {
  const { layout, sideLength } = state;
  for (let j = 0; j < layout.length; j++) {
    for (let i = 0; i < layout[j].length; i++) {
      if (layout[j][i] === face) return { x: i * sideLength, y: j * sideLength };
    }
  }
  throw new Error(`Cannot find ${face} in layout`);
}

type CubeFace = {
  face: number,
  direction: Record<Direction, FaceSide>,
};
type FaceSide = {
  face: number,
  side: Direction,
};


const SAMPLE_CUBE_LAYOUT: Layout = [
  [0, 0, 1, 0],
  [2, 3, 4, 0],
  [0, 0, 5, 6],
];
const INPUT_CUBE_LAYOUT: Layout = [
  [0, 1, 2],
  [0, 3, 0],
  [4, 5, 0],
  [6, 0, 0],
];

type CubeMap = CubeFace[];
// SMALL_CUBE_MAP[face][side:Direction]
// provide offsets instead of directions and faces
// that way it is a simple calculation instead of a massive switch statement
const CUBE_MAP = {
  sample: {
    part1: [
      {
        // dummy face
        face: 0,
        direction: {
          [Direction.RIGHT]: { face: 0, side: Direction.LEFT },
          [Direction.DOWN]: { face: 0, side: Direction.UP },
          [Direction.LEFT]: { face: 0, side: Direction.RIGHT },
          [Direction.UP]: { face: 0, side: Direction.DOWN },
        }
      },
      {
        face: 1,
        direction: {
          [Direction.RIGHT]: { face: 1, side: Direction.LEFT },
          [Direction.DOWN]: { face: 4, side: Direction.UP },
          [Direction.LEFT]: { face: 1, side: Direction.RIGHT },
          [Direction.UP]: { face: 5, side: Direction.DOWN },
        }
      },
      {
        face: 2,
        direction: {
          [Direction.RIGHT]: { face: 3, side: Direction.LEFT },
          [Direction.DOWN]: { face: 2, side: Direction.UP },
          [Direction.LEFT]: { face: 4, side: Direction.RIGHT },
          [Direction.UP]: { face: 2, side: Direction.DOWN },
        }
      },
      {
        face: 3,
        direction: {
          [Direction.RIGHT]: { face: 4, side: Direction.LEFT },
          [Direction.DOWN]: { face: 3, side: Direction.UP },
          [Direction.LEFT]: { face: 2, side: Direction.RIGHT },
          [Direction.UP]: { face: 3, side: Direction.DOWN },
        }
      },
      {
        face: 4,
        direction: {
          [Direction.RIGHT]: { face: 2, side: Direction.LEFT },
          [Direction.DOWN]: { face: 5, side: Direction.UP },
          [Direction.LEFT]: { face: 3, side: Direction.RIGHT },
          [Direction.UP]: { face: 1, side: Direction.DOWN },
        }
      },
      {
        face: 5,
        direction: {
          [Direction.RIGHT]: { face: 6, side: Direction.LEFT },
          [Direction.DOWN]: { face: 1, side: Direction.UP },
          [Direction.LEFT]: { face: 6, side: Direction.RIGHT },
          [Direction.UP]: { face: 4, side: Direction.DOWN },
        }
      },
      {
        face: 6,
        direction: {
          [Direction.RIGHT]: { face: 5, side: Direction.LEFT },
          [Direction.DOWN]: { face: 6, side: Direction.UP },
          [Direction.LEFT]: { face: 5, side: Direction.RIGHT },
          [Direction.UP]: { face: 6, side: Direction.DOWN },
        }
      },
    ],
    part2: [
      {
        // dummy face
        face: 0,
        direction: {
          [Direction.RIGHT]: { face: 0, side: Direction.LEFT },
          [Direction.DOWN]: { face: 0, side: Direction.UP },
          [Direction.LEFT]: { face: 0, side: Direction.RIGHT },
          [Direction.UP]: { face: 0, side: Direction.DOWN },
        }
      },
      {
        face: 1,
        direction: {
          [Direction.RIGHT]: { face: 6, side: Direction.RIGHT },
          [Direction.DOWN]: { face: 4, side: Direction.UP },
          [Direction.LEFT]: { face: 3, side: Direction.UP },
          [Direction.UP]: { face: 2, side: Direction.UP },
        }
      },
      {
        face: 2,
        direction: {
          [Direction.RIGHT]: { face: 3, side: Direction.LEFT },
          [Direction.DOWN]: { face: 5, side: Direction.DOWN },
          [Direction.LEFT]: { face: 6, side: Direction.DOWN },
          [Direction.UP]: { face: 1, side: Direction.UP },
        }
      },
      {
        face: 3,
        direction: {
          [Direction.RIGHT]: { face: 4, side: Direction.LEFT },
          [Direction.DOWN]: { face: 5, side: Direction.LEFT },
          [Direction.LEFT]: { face: 2, side: Direction.RIGHT },
          [Direction.UP]: { face: 1, side: Direction.LEFT },
        }
      },
      {
        face: 4,
        direction: {
          [Direction.RIGHT]: { face: 6, side: Direction.UP },
          [Direction.DOWN]: { face: 5, side: Direction.UP },
          [Direction.LEFT]: { face: 3, side: Direction.RIGHT },
          [Direction.UP]: { face: 1, side: Direction.DOWN },
        }
      },
      {
        face: 5,
        direction: {
          [Direction.RIGHT]: { face: 6, side: Direction.LEFT },
          [Direction.DOWN]: { face: 2, side: Direction.DOWN },
          [Direction.LEFT]: { face: 3, side: Direction.DOWN },
          [Direction.UP]: { face: 4, side: Direction.DOWN },
        }
      },
      {
        face: 6,
        direction: {
          [Direction.RIGHT]: { face: 1, side: Direction.RIGHT },
          [Direction.DOWN]: { face: 2, side: Direction.LEFT },
          [Direction.LEFT]: { face: 5, side: Direction.RIGHT },
          [Direction.UP]: { face: 4, side: Direction.RIGHT },
        }
      },
    ],
  },
  input: {
    part1: [
      {
        face: 0,
        direction: {
          [Direction.RIGHT]: { face: 0, side: Direction.LEFT },
          [Direction.DOWN]: { face: 0, side: Direction.UP },
          [Direction.LEFT]: { face: 0, side: Direction.RIGHT },
          [Direction.UP]: { face: 0, side: Direction.DOWN },
        }
      },
      {
        face: 1,
        direction: {
          [Direction.RIGHT]: { face: 2, side: Direction.LEFT },
          [Direction.DOWN]: { face: 3, side: Direction.UP },
          [Direction.LEFT]: { face: 2, side: Direction.RIGHT },
          [Direction.UP]: { face: 5, side: Direction.DOWN },
        }
      },
      {
        face: 2,
        direction: {
          [Direction.RIGHT]: { face: 1, side: Direction.LEFT },
          [Direction.DOWN]: { face: 2, side: Direction.UP },
          [Direction.LEFT]: { face: 1, side: Direction.RIGHT },
          [Direction.UP]: { face: 2, side: Direction.DOWN },
        }
      },
      {
        face: 3,
        direction: {
          [Direction.RIGHT]: { face: 3, side: Direction.LEFT },
          [Direction.DOWN]: { face: 5, side: Direction.UP },
          [Direction.LEFT]: { face: 3, side: Direction.RIGHT },
          [Direction.UP]: { face: 1, side: Direction.DOWN },
        }
      },
      {
        face: 4,
        direction: {
          [Direction.RIGHT]: { face: 5, side: Direction.LEFT },
          [Direction.DOWN]: { face: 6, side: Direction.UP },
          [Direction.LEFT]: { face: 5, side: Direction.RIGHT },
          [Direction.UP]: { face: 6, side: Direction.DOWN },
        }
      },
      {
        face: 5,
        direction: {
          [Direction.RIGHT]: { face: 4, side: Direction.LEFT },
          [Direction.DOWN]: { face: 1, side: Direction.UP },
          [Direction.LEFT]: { face: 4, side: Direction.RIGHT },
          [Direction.UP]: { face: 3, side: Direction.DOWN },
        }
      },
      {
        face: 6,
        direction: {
          [Direction.RIGHT]: { face: 6, side: Direction.LEFT },
          [Direction.DOWN]: { face: 4, side: Direction.UP },
          [Direction.LEFT]: { face: 6, side: Direction.RIGHT },
          [Direction.UP]: { face: 4, side: Direction.DOWN },
        }
      },
    ],
    part2: [
      {
        face: 0,
        direction: {
          [Direction.RIGHT]: { face: 0, side: Direction.LEFT },
          [Direction.DOWN]: { face: 0, side: Direction.UP },
          [Direction.LEFT]: { face: 0, side: Direction.RIGHT },
          [Direction.UP]: { face: 0, side: Direction.DOWN },
        }
      },
      {
        face: 1,
        direction: {
          [Direction.RIGHT]: { face: 2, side: Direction.LEFT },
          [Direction.DOWN]: { face: 3, side: Direction.UP },
          [Direction.LEFT]: { face: 4, side: Direction.LEFT },
          [Direction.UP]: { face: 6, side: Direction.LEFT },
        }
      },
      {
        face: 2,
        direction: {
          [Direction.RIGHT]: { face: 5, side: Direction.RIGHT },
          [Direction.DOWN]: { face: 3, side: Direction.RIGHT },
          [Direction.LEFT]: { face: 1, side: Direction.RIGHT },
          [Direction.UP]: { face: 6, side: Direction.DOWN },
        }
      },
      {
        face: 3,
        direction: {
          [Direction.RIGHT]: { face: 2, side: Direction.DOWN },
          [Direction.DOWN]: { face: 5, side: Direction.UP },
          [Direction.LEFT]: { face: 4, side: Direction.UP },
          [Direction.UP]: { face: 1, side: Direction.DOWN },
        }
      },
      {
        face: 4,
        direction: {
          [Direction.RIGHT]: { face: 5, side: Direction.LEFT },
          [Direction.DOWN]: { face: 6, side: Direction.UP },
          [Direction.LEFT]: { face: 1, side: Direction.LEFT },
          [Direction.UP]: { face: 3, side: Direction.LEFT },
        }
      },
      {
        face: 5,
        direction: {
          [Direction.RIGHT]: { face: 2, side: Direction.RIGHT },
          [Direction.DOWN]: { face: 6, side: Direction.RIGHT },
          [Direction.LEFT]: { face: 4, side: Direction.RIGHT },
          [Direction.UP]: { face: 3, side: Direction.DOWN },
        }
      },
      {
        face: 6,
        direction: {
          [Direction.RIGHT]: { face: 5, side: Direction.DOWN },
          [Direction.DOWN]: { face: 2, side: Direction.UP },
          [Direction.LEFT]: { face: 1, side: Direction.UP },
          [Direction.UP]: { face: 4, side: Direction.DOWN },
        }
      },
    ],
  }
}


function getWrapInfo(state: State, from: FaceSide, to: FaceSide): Cursor {
  const { sideLength, cursor: { pos: { x, y } } } = state;
  const maxXY = sideLength - 1;

  switch (from.side) {
    case Direction.RIGHT:
      switch (to.side) {
        case Direction.RIGHT:
          return {
            face: to.face,
            dir: Direction.LEFT,
            pos: { x, y: maxXY - y }
          };
        case Direction.DOWN:
          return {
            face: to.face,
            dir: Direction.UP,
            pos: { x: y, y: maxXY },
          };
        case Direction.LEFT:
          return {
            face: to.face,
            dir: Direction.RIGHT,
            pos: { x: 0, y: y },
          };
        case Direction.UP:
          return {
            face: to.face,
            dir: Direction.DOWN,
            pos: { x: maxXY - y, y: 0 },
          };
      }
    case Direction.DOWN:
      switch (to.side) {
        case Direction.RIGHT:
          return {
            face: to.face,
            dir: Direction.LEFT,
            pos: { x: maxXY, y: x },
          };
        case Direction.DOWN:
          return {
            face: to.face,
            dir: Direction.UP,
            pos: { x: maxXY - x, y: maxXY },
          };
        case Direction.LEFT:
          return {
            face: to.face,
            dir: Direction.RIGHT,
            pos: { x: 0, y: maxXY - x },
          };
        case Direction.UP:
          return {
            face: to.face,
            dir: Direction.DOWN,
            pos: { x: x, y: 0 },
          }
      }
    case Direction.LEFT:
      switch (to.side) {
        case Direction.RIGHT:
          return {
            face: to.face,
            dir: Direction.LEFT,
            pos: { x: maxXY, y: y },
          };
        case Direction.DOWN:
          return {
            face: to.face,
            dir: Direction.UP,
            pos: { x: maxXY - y, y: maxXY },
          };
        case Direction.LEFT:
          return {
            face: to.face,
            dir: Direction.RIGHT,
            pos: { x: 0, y: maxXY - y },
          }
        case Direction.UP:
          return {
            face: to.face,
            dir: Direction.DOWN,
            pos: { x: y, y: 0 }
          };
      }
    case Direction.UP:
      switch (to.side) {
        case Direction.RIGHT:
          return {
            face: to.face,
            dir: Direction.LEFT,
            pos: { x: maxXY, y: maxXY - x },
          }
        case Direction.DOWN:
          return {
            face: to.face,
            dir: Direction.UP,
            pos: { x: x, y: maxXY },
          }
        case Direction.LEFT:
          return {
            face: to.face,
            dir: Direction.RIGHT,
            pos: { x: 0, y: x },
          }
        case Direction.UP:
          return {
            face: to.face,
            dir: Direction.DOWN,
            pos: { x: maxXY - x, y: 0 },
          }
      }
  }
}

function walkWithWrapping(instructions: Instruction[], state: State): State {
  const shouldDebug = false;
  if (shouldDebug) console.log('Initial');
  if (shouldDebug) dumpMap(state);
  if (shouldDebug) console.log('----------------');
  instructions.forEach(instruction => {
    applyInstruction(state, instruction);
    if (shouldDebug) console.log('Instruction: ', instruction);
    if (shouldDebug) dumpMap(state);
    if (shouldDebug) console.log('    cursor: ', state.cursor.face, state.cursor.pos, state.cursor.dir)
    if (shouldDebug) console.log('----------------');
  });
  return state;
}

function applyInstruction(state: State, instruction: Instruction) {
  const { map, cursor: { face, pos, dir } } = state;
  if (typeof instruction === 'number') {
    const steps: number = instruction;
    let cursor: Cursor = { face, pos: { ...pos }, dir: dir };
    for (let i = 0; i < steps; i++) {
      state.map[cursor.face][cursor.pos.y][cursor.pos.x] = TileDirectionMap[cursor.dir];
      const nextCur: Cursor = advancePosition(state);
      if (map[nextCur.face][nextCur.pos.y][nextCur.pos.x] === Tile.SOLID) break;
      cursor = nextCur;
      state.cursor = cursor;
    }
  } else {
    state.cursor.dir = modulo(
      state.cursor.dir + (instruction === InstructionDirection.LEFT ? -1 : 1),
      Object.keys(Direction).length / 2, // TS enums on numbers are double length
    );
    state.map[face][pos.y][pos.x] = TileDirectionMap[dir];
  }
}

function advancePosition(state: State): Cursor {
  const { cubeMap, cursor: { face, pos, dir }, sideLength } = state;
  const offsets = DIR_OFFSETS[dir];
  const nx = pos.x + offsets.x;
  const ny = pos.y + offsets.y;

  const faceMap = cubeMap[face];

  if (nx < 0) {
    return getWrapInfo(state, { face, side: Direction.LEFT }, faceMap.direction[Direction.LEFT]);
  }
  if (ny >= sideLength) {
    return getWrapInfo(state, { face, side: Direction.DOWN }, faceMap.direction[Direction.DOWN]);
  }
  if (nx >= sideLength) {
    return getWrapInfo(state, { face, side: Direction.RIGHT }, faceMap.direction[Direction.RIGHT]);
  }
  if (ny < 0) {
    return getWrapInfo(state, { face, side: Direction.UP }, faceMap.direction[Direction.UP]);
  }

  return {
    face,
    pos: { x: nx, y: ny },
    dir,
  }
}

function dumpMap(state: State) {
  const { layout, map, sideLength } = state;
  const tiles: Tile[][] = [];
  layout.forEach(row => {
    for (let tileRow = 0; tileRow < sideLength; tileRow++) {
      const tileCols: Tile[] = [];
      tiles.push(tileCols);
      row.forEach(face => {
        if (face === 0) {
          tileCols.push(...(new Array(sideLength).fill(Tile.NONE)));
        } else {
          tileCols.push(...map[face][tileRow]);
        }
        tileCols.push(Tile.NONE);
      });
    }
    tiles.push([]);
  });
  const result = tiles.map(row => row.join('')).join('\n');
  console.log(result);
}

function getInitialState(
  map: Tile[][][],
  layout: Layout,
  part: 'part1' | 'part2',
  input: 'sample' | 'input',
): State {
  const startingPoint: Point2 = {
    x: map[1][0].indexOf(Tile.OPEN),
    y: 0,
  }
  const state: State = {
    map,
    cubeMap: CUBE_MAP[input][part],
    layout,
    sideLength: map[1].length,
    cursor: {
      face: 1,
      pos: startingPoint,
      dir: Direction.RIGHT,
    },
  }
  return state;
}

function processInput(name: string = 'input'): Input {
  const { sideLength, layout } = name === 'sample'
    ? { sideLength: 4, layout: SAMPLE_CUBE_LAYOUT }
    : { sideLength: 50, layout: INPUT_CUBE_LAYOUT };
  const tiles: Tile[][][] = new Array(7).fill(undefined).map(_ => []);
  let instructions: Instruction[] = [];
  getInput(__filename, name).split('\n').forEach((line, lineIdx) => {
    if (line === '') return;
    if (isTile(line.slice(0, 1))) {
      // process tile line
      const inputTiles: Tile[] = line.split('').filter(isTile);
      const layoutRow = Math.floor(lineIdx / sideLength);
      for (let i = 0; i < layout[layoutRow].length; i++) {
        const face = layout[layoutRow][i];
        if (face === 0) continue;
        const base = sideLength * i;
        tiles[face].push(inputTiles.slice(base, base + sideLength));

      }
    } else {
      // process instruction set
      const regex = /(?<steps>\d+)(?<turn>[LR])/g;
      const tokens: Instruction[] = [...line.matchAll(regex)].flatMap(tokens => {
        const instructionDirection = tokens[2];
        if (isInstructionDirection(instructionDirection)) {
          const steps = parseInt(tokens[1], 10);
          return [
            steps,
            instructionDirection,
          ];
        }
        throw new Error("Invalid instruction direction: " + instructionDirection);
      });
      const regexEnd = /(\d)+$/;
      const lastNum = line.match(regexEnd)?.[1];
      if (lastNum != null) {
        tokens.push(parseInt(lastNum, 10));
      }
      instructions = tokens;
    }
  });

  return {
    map: tiles,
    layout,
    instructions,
  };
}

process();
