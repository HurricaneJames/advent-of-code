import * as fs from 'fs';

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
  const input = fs.readFileSync("./d10.input.txt").toString();

  const instructions = input.split('\n').map(line => {
    const [instr, value] = line.split(' ');
    switch (instr) {
      case 'noop':
        return { instr };
      case 'addx':
        return { instr, param: parseInt(value, 10) };
    }
  });

  let register = 1;
  const samples: Array<number> = [];
  const screen: Array<Array<string>> = new Array(SCREEN_ROWS).fill(undefined).map(_ => new Array(SCREEN_COLS).fill('.'));

  let delay = 0;
  let valueOnDelay = 0;

  for (let clock=1; clock <= MAX_CLOCK; clock++) {
    if ((clock - SAMPLE_BASE) % SAMPLE_RATE === 0) {
      samples.push(clock * register);
    }

    const col = (clock % SCREEN_COLS) - 1;
    if (col >= register -1 && col <= register + 1) {
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

  console.log('signalSum: ', samples.reduce((sum, sample) => sum += sample, 0));
  // console.log('samples  : ', samples);
  console.log(screen.map(row => row.join('')).join('\n'));
})();
