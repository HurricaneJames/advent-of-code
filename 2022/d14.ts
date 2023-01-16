import { dumpResult, getInput } from "./Utils";

interface Point {
  x: number,
  y: number,
}

interface Window {
  base: number;
  width: number;
  height: number;
}

const AIR = '.';
const ROCK = '#';
const SAND = 'o';

interface State {
  data: Array<Array<string>>,
  window: Window,
}
(function process() {
  const input = processInput();

  calcPartA(generateState(input.lines, input.window));
  calcPartB(generateState(input.lines, input.window));
})();

function calcPartA({ data, window }: State) {
  // bigger picture
  let canStop = false;
  let totalSand = 0;

  while (!canStop) {// emit particle
    totalSand++
    let particleX = 500 - window.base;
    let particleY = 0;
    let canMove = true;
    while (canMove) {
      if (data[particleY + 1][particleX] === AIR) {
        particleY++;
      } else if (particleX === 1) {
        canStop = true;
        break;
      } else if (data[particleY + 1][particleX - 1] === AIR) {
        particleY++;
        particleX--;
      } else if (particleX === window.width) {
        canStop = true;
        totalSand--;
        break;
      } else if (data[particleY + 1][particleX + 1] === AIR) {
        particleY++;
        particleX++;
      } else {
        canMove = false;
      }
    }
    data[particleY][particleX] = SAND;
    // outputState(state, window);
  }
  // outputState(state, window);
  dumpResult("Part 1 - total sand", totalSand, 858);
}

function calcPartB(state: State) {
  const { data, window } = state;

  data.push(new Array(state.data[0].length).fill(AIR));
  data.push(new Array(state.data[0].length).fill(ROCK));
  // bigger picture
  let canStop = false;
  let totalSand = 0;

  while (!canStop) {// emit particle
    totalSand++
    // if (totalSand === 100) canStop = true;
    let particleX = 500 - window.base;
    let particleY = 0;
    let canMove = true;
    while (canMove) {
      if (particleX === 1) {
        // prefix the input and continue
        addPrefixColumn(state);
        particleX++;
      }
      if (particleX === window.width) {
        addPostfixColumn(state);
      }

      if (data[particleY + 1][particleX] === AIR) {
        particleY++;
      } else if (data[particleY + 1][particleX - 1] === AIR) {
        particleY++;
        particleX--;
      } else if (data[particleY + 1][particleX + 1] === AIR) {
        particleY++;
        particleX++;
      } else {
        canMove = false;
        if (particleX === 500 - window.base && particleY === 0) {
          canStop = true;
          break;
        }
      }
    }
    data[particleY][particleX] = SAND;
    // outputState(data, window);
  }
  // outputState(data, window);
  dumpResult("Part 2 - total sand", totalSand, 26845);
}

function addPrefixColumn(state: State) {
  state.data.forEach(row => row.unshift(AIR));
  state.data[state.data.length - 1][0] = ROCK;
  state.window.base--;
  state.window.width++;
}

function addPostfixColumn(state: State) {
  state.data.forEach(row => row.push(AIR));
  state.data[state.data.length-2][state.data[0].length-1] = AIR;
  state.data[state.data.length - 1][state.data[0].length-1] = ROCK;
  state.window.width++;
}

function generateState(lines: Array<Array<Point>>, window: Window): State {
  const state = new Array(window.height + 1).fill(undefined).map(_ => new Array(window.width + 1).fill(AIR));
  lines.forEach(points => {
    for (let i = 0; i < points.length - 1; i++) {
      const from = points[i];
      const to = points[i + 1];
      const dx = to.x - from.x;
      const rangeX = Math.abs(dx);
      const dirX = dx !== 0 ? dx / rangeX : 0;
      const dy = to.y - from.y;
      const rangeY = Math.abs(dy);
      const dirY = dy !== 0 ? dy / rangeY : 0;
      // console.log("%o -> %o rx: %d, ry: %d, dx: %d, dy: %d", from, to, rangeX, rangeY, dirX, dirY);
      for (let x = 0; x <= rangeX; x++) {
        for (let y = 0; y <= rangeY; y++) {
          const nx = from.x + x * dirX;
          const ny = from.y + y * dirY;
          // console.log('  adding: ', nx - window.base, ny);
          state[ny][nx - window.base] = '#'
        }
      }
    }
  })
  return { data: state, window: Object.assign({}, window) };
}

function processInput() {
  let minX = 500, maxX = 500;
  let maxY = 0;
  const lines = getInput(__filename).split('\n').reduce((scan: Array<Array<Point>>, line) => {
    const points = line.split(' -> ').map(p => {
      const [x, y] = p.split(',').map(i => parseInt(i, 10));
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      return { x, y };
    });
    scan.push(points);
    return scan;
  }, []);

  return { lines, window: { base: minX, width: maxX - minX, height: maxY } };
}

function outputState(state: Array<Array<string>>, window: Window) {
  const sourceX = (500 - window.base);
  let image = state.map((r, idx) => {
    if (idx === 0) {
      const rp = r.slice();
      rp[sourceX] = 'S';
      return rp.join('');
    }
    return r.join('');
  }).join('\n');
  console.log("--- State ---");
  console.log('window: ', window);
  console.log(image);
  console.log("--- ----- ---");
}