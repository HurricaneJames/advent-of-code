import { dumpResult, getInput, modulo } from './Utils';

type Point2 = { x: number, y: number }
export enum Direction {
  RIGHT = '>',
  DOWN = 'v',
  LEFT = '<',
  UP = '^',
  NONE = '*',
};
enum Blizzard {
  UP = '^',
  DOWN = 'v',
  LEFT = '<',
  RIGHT = '>',
}
function isBlizzard(t: string): t is Blizzard {
  return Object.values(Blizzard).includes(t as Blizzard);
}

type Tile = Blizzard | '#' | '.';
type Input = {
  map: Tile[][],
  start: Point2,
  end: Point2,
}
type State = {
  pos: Point2,
  time: number,
}

function calc(
  description: string,
  input: Input,
  expected: number | null,
  goBackForSnacks: boolean,
) {
  let result = findStepsInShortestPath(input, getInitialState(input));
  if (goBackForSnacks) {
    const goBackTime = findStepsInShortestPath({
      map: input.map,
      start: input.end,
      end: input.start,
    }, { pos: input.end, time: result });
    result = findStepsInShortestPath(input, { pos: input.start, time: goBackTime })
  }
  dumpResult(description, result, expected);
}

function findStepsInShortestPath(input: Input, state: State): number {
  const { map, end } = input;

  // visited[time][y][x]
  const visited: boolean[][][] = [new Array(map.length).fill(undefined).map(_ => (
    new Array(map[0].length).fill(false)
  ))]
  // openSpaces[time][y][x]
  const openSpaces: boolean[][][] = [findOpenSpacesAtTime(input, 0)];

  const queue: State[] = [state];
  while (queue.length > 0) {
    const state = queue.shift()!;
    const { pos, time } = state;
    if (pos.x === end.x && pos.y === end.y) { return time; }

    // compute openspaces and allocated visited if not already available
    openSpaces[time + 1] ||= findOpenSpacesAtTime(input, time + 1);
    visited[time + 1] ||= new Array(map.length).fill(undefined).map(_ => (
      new Array(map[0].length).fill(false)
    ));

    getOptions(state, input)
      .filter(({ pos, time }) => (
        // only add option if the space is available and not alreday checked
        openSpaces[time][pos.y][pos.x] && !visited[time][pos.y][pos.x]
      ))
      .forEach(option => {
        queue.push(option);
        visited[option.time][option.pos.y][option.pos.x] = true;
      })
  }
  throw new Error('No path to target');
}

function dumpOpenSpaces(openSpaces: boolean[][], padding: number = 0) {
  console.log(openSpaces.map(r => r.map(s => s ? '.' : '*').join('')).map(s => ' '.repeat(padding) + s).join('\n'));
}

function findOpenSpacesAtTime(input: Input, time: number): boolean[][] {
  const { map } = input;
  const width = map[0].length;
  const height = map.length;
  const openSpaces = new Array(height).fill(undefined).map(_ => new Array(width).fill(true));

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const tile = map[y][x];
      let posAtTime = null;
      if (posAtTime = getBlizzardPositionAtTime(input, {x, y}, time)) {
        openSpaces[posAtTime.y][posAtTime.x] = false;
      }
    }
  }
  return openSpaces;
}

function getBlizzardPositionAtTime({ map }: Input, { x, y }: Point2, time: number): Point2 | null {
  const tile = map[y][x];
  switch (tile) {
    case Blizzard.LEFT:
      return { y, x: modulo((x - 1) - time, map[0].length - 2) + 1 };
    case Blizzard.RIGHT:
      return { y, x: modulo((x - 1) + time, map[0].length - 2) + 1 };
    case Blizzard.UP:
      return { x, y: modulo((y - 1) - time, map.length - 2) + 1 };
    case Blizzard.DOWN:
      return { x, y: modulo((y - 1) + time, map.length - 2) + 1 };
    case '#':
    case '.':
      return null;
  }
}

function getOptions({ pos: { x, y }, time }: State, input: Input): State[] {
  const options = [];
  if (isValidOption(input, { x: x + 1, y: y })) options.push({ x: x + 1, y: y });
  if (isValidOption(input, { x: x, y: y + 1 })) options.push({ x: x, y: y + 1 });
  if (isValidOption(input, { x: x, y: y - 1 })) options.push({ x: x, y: y - 1 });
  if (isValidOption(input, { x: x - 1, y: y })) options.push({ x: x - 1, y: y });
  options.push({ x, y });
  return options.map(pos => ({ pos, time: time + 1 }));
}

function isValidOption({ map }: Input, pos: Point2): boolean {
  return (
    pos.x >= 0 &&
    pos.y >= 0 &&
    pos.x < map[0].length &&
    pos.y < map.length &&
    map[pos.y][pos.x] !== '#'
  );
}

function getInitialState({ map, start }: Input): State {
  return {
    pos: { x: start.x, y: start.y },
    time: 0,
  };
}

function processInput(name: string = 'input'): Input {
  const map = getInput(__filename, name)
    .split('\n')
    .map(line => line.split('').map(t => {
      if (t === '#' || t === '.' || isBlizzard(t)) return t;
      throw new Error("Unknown tile input: " + t);
    }));
  const startX = map[0].findIndex(t => t !== '#');
  const endX = map[map.length - 1].findIndex(t => t !== '#');
  if (startX === -1) throw new Error("No start point in " + map[0]);
  if (endX === -1) throw new Error("No End point in " + map[map.length - 1]);

  return {
    map,
    start: { x: startX, y: 0 },
    end: { x: endX, y: map.length - 1 }
  };
}

function process() {
  calc('Part 1 (sample)', processInput('sample'), 18, false);
  calc('Part 1', processInput(), 305, false);
  calc('Part 2 (sample)', processInput('sample'), 54, true);
  calc('Part 2', processInput(), 905, true);
}
process();
