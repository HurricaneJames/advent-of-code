import * as fs from 'fs';

interface Point {
  x: number;
  y: number;
}

interface State {
  knots: Array<Point>;
  tailPositions: Set<string>;
  max: Point,
  min: Point,
}

(function process() {
  const input = fs.readFileSync("./d09.input.txt").toString();

  const state = input.split('\n').reduce((state: State, val: string) => {
    const [direction, countToken] = val.split(' ');
    const count = parseInt(countToken, 10);
    // console.log('-----> ', direction, count);
    switch (direction) {
      case 'U':
        for (let i = 0; i < count; i++) {
          state.knots[0].y += 1;
          updateTail(state)
        }
        break;
      case 'D':
        for (let i = 0; i < count; i++) {
          state.knots[0].y -= 1;
          updateTail(state)
        }
        break;
      case 'L':
        for (let i = 0; i < count; i++) {
          state.knots[0].x -= 1;
          updateTail(state)
        }
        break;
      case 'R':
        for (let i = 0; i < count; i++) {
          state.knots[0].x += 1;
          updateTail(state)
        }
        break;
    }
    updateWindow(state);
    // dumpTailChart(state);
    // dumpKnots(state);
    return state;
  }, {
    knots: initKnots(10),
    tailPositions: new Set<string>(),
    max: { x: 0, y: 0 },
    min: { x: 0, y: 0 },
  });

  console.log("Tail Chart: ", state.tailPositions.size)
  dumpTailChart(state);
})();

function initKnots(count: number): Array<Point> {
  return (new Array(count)).fill(undefined).map(_ => ({ x: 0, y: 0 }));
}

function dumpTailChart(state: State) {
  const rows = state.max.y - state.min.y + 1;
  const cols = state.max.x - state.min.x + 1;
  console.log('<%d, %d> to <%d, %d> (%d rows x %d cols)', state.min.x, state.min.y, state.max.x, state.max.y, rows, cols);
  console.log(new Array(rows).fill(undefined).map((_, j) =>
    new Array(cols).fill(undefined).map((_, i) => {
      const x = state.min.x + i;
      const y = state.min.y + j;
      if (x === 0 && y === 0) { return 's'; }
      return state.tailPositions.has(`${x},${y}`) ? '#' : '.'
    }
    ).join('')
  ).reverse().join('\n'));
}

function dumpKnots(state: State) {
  const rows = state.max.y - state.min.y + 1;
  const cols = state.max.x - state.min.x + 1;
  console.log(new Array(rows).fill(undefined).map((_, j) =>
    new Array(cols).fill(undefined).map((_, i) => {
      const x = state.min.x + i;
      const y = state.min.y + j;
      for (let n=0; n<state.knots.length; n++) {
        if (state.knots[n].x === x && state.knots[n].y === y) return n;
      }
      if (x === 0 && y === 0) { return 's'; }
      return '.';
    }
    ).join('')
  ).reverse().join('\n'));
}

function updateWindow(state: State) {
  if (state.knots[0].x > state.max.x) state.max.x = state.knots[0].x;
  if (state.knots[0].x < state.min.x) state.min.x = state.knots[0].x;
  if (state.knots[0].y > state.max.y) state.max.y = state.knots[0].y;
  if (state.knots[0].y < state.min.y) state.min.y = state.knots[0].y;
}

function updateTail(state: State) {
  for (let n = 1; n < state.knots.length; n++) {
    const dx = state.knots[n - 1].x - state.knots[n].x;
    const dy = state.knots[n - 1].y - state.knots[n].y;

    if (dx > 1) {
      state.knots[n].x += 1
      if (Math.abs(dy) <= 1) state.knots[n].y = state.knots[n - 1].y;
    }
    if (dx < -1) {
      state.knots[n].x -= 1;
      if (Math.abs(dy) <= 1) state.knots[n].y = state.knots[n - 1].y;
    }
    
    if (dy > 1) {
      if (Math.abs(dx) <= 1) state.knots[n].x = state.knots[n - 1].x;
      state.knots[n].y += 1;
    }
    if (dy < -1) {
      if (Math.abs(dx) <= 1) state.knots[n].x = state.knots[n - 1].x;
      state.knots[n].y -= 1;
    }

    if (n === (state.knots.length - 1)) {
      state.tailPositions.add(`${state.knots[n].x},${state.knots[n].y}`);
    }
  }
}
