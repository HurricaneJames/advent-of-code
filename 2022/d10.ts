import { dumpResult, getInput } from "./Utils";

interface Noop {
  instr: 'noop',
}

interface Addx {
  instr: 'addx',
  param: number,
}

type Instruction = Noop | Addx;

const MAX_CLOCK = 240;
const SAMPLE_BASE = 20;
const SAMPLE_RATE = 40;

const SCREEN_ROWS = 6;
const SCREEN_COLS = 40;

(function process() {
  const input = getInput(__filename);

  const instructions = input.split('\n').map(line => {
    const [instr, value] = line.split(' ');
    switch (instr) {
      case 'noop':
        return { instr };
      case 'addx':
        return { instr, param: parseInt(value, 10) };
      default:
        throw new Error("Unknown instruction: " + instr);
    }
  });

  let register = 1;
  const samples: Array<number> = [];
  const screen: Array<Array<string>> = new Array(SCREEN_ROWS).fill(undefined).map(_ => new Array(SCREEN_COLS).fill('.'));

  let delay = 0;
  let valueOnDelay = 0;

  for (let clock = 1; clock <= MAX_CLOCK; clock++) {
    if ((clock - SAMPLE_BASE) % SAMPLE_RATE === 0) {
      samples.push(clock * register);
    }

    const col = (clock % SCREEN_COLS) - 1;
    if (col >= register - 1 && col <= register + 1) {
      const row = Math.floor(clock / SCREEN_COLS);
      screen[row][col] = '#'
    }

    if (delay > 0) {
      delay--;
      if (delay === 0) {
        register = valueOnDelay;
      }
      continue;
    }

    const instruction = instructions.shift();
    if (instruction === undefined) continue;
    switch (instruction.instr) {
      case 'noop': continue;
      case 'addx': {
        delay = 1;
        valueOnDelay = register + instruction.param;
      }
    }
  }

  dumpResult("Part 1 - Signal Sum", samples.reduce((sum, sample) => sum += sample, 0), 12640);

  const expectedMessage = [
    '',
    '####.#..#.###..####.#....###....##.###..',
    '#....#..#.#..#....#.#....#..#....#.#..#.',
    '###..####.###....#..#....#..#....#.#..#.',
    '#....#..#.#..#..#...#....###.....#.###..',
    '#....#..#.#..#.#....#....#.#..#..#.#.#..',
    '####.#..#.###..####.####.#..#..##..#..#.',
  ].join('\n');
  const result = '\n' + screen.map(row => row.join('')).join('\n');
  dumpResult("Part 2 - Expected", result, expectedMessage);
})();
