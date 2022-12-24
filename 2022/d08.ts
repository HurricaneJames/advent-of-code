import * as fs from 'fs';

(function process() {
  const input = fs.readFileSync("./d08.input.txt").toString();
  const trees = input.split('\n').reduce((grid: Array<Array<number>>, val: string) => {
    grid.push(val.split('').map(i => parseInt(i, 10)));
    return grid;
  },
    []);
  // console.log('Trees: ', trees);
  let visible = 0;
  let maxVi = 1, maxVj = 1;
  const visScores: Array<Array<number>> = (new Array(trees.length)).fill(undefined).map(_ => (new Array(trees[0].length).fill(0)));
  for (let j = 1; j < trees[0].length - 1; j++) {
    for (let i = 1; i < trees.length - 1; i++) {
      // part 1
      if (isVisible(trees, i, j)) visible++

      // part 2
      if ((visScores[j][i] = calcVisScore(trees, i, j)) > visScores[maxVj][maxVi]) {
        maxVi = i;
        maxVj = j;
      }
    }
  }
  console.log("Visible: ", visible + 2 * trees.length + 2 * (trees[0].length - 2));
  console.log("Max Visibility Score: ", visScores[maxVj][maxVi]);
})();

function calcVisScore(trees: Array<Array<number>>, i: number, j: number): number {
  const vxm = calcVisScoreX(trees, i, j, -1);
  const vxp = calcVisScoreX(trees, i, j, 1);
  const vym = calcVisScoreY(trees, i, j, -1);
  const vyp = calcVisScoreY(trees, i, j, 1);
  return vxm * vxp * vym * vyp;
}

function calcVisScoreX(trees: Array<Array<number>>, i: number, j: number, dx: -1 | 1): number {
  const target = getTarget(i, dx, trees[0].length);
  for (let n = 1; n < target + 1; n++) {
    const di = i + dx * n;
    if (trees[j][di] >= trees[j][i]) { return n; }

  }
  return target;
}

function calcVisScoreY(trees: Array<Array<number>>, i: number, j: number, dy: -1 | 1): number {
  const target = getTarget(j, dy, trees.length);
  for (let n = 1; n < target + 1; n++) {
    const dj = j + dy * n;
    if (trees[dj][i] >= trees[j][i]) { return n; }
  }
  return target;
}

function isVisible(trees: Array<Array<number>>, i: number, j: number): boolean {
  if (
    isVisibleInHorizontal(trees, i, j, -1) ||
    isVisibleInHorizontal(trees, i, j, 1) ||
    isVisibleInVertical(trees, i, j, -1) ||
    isVisibleInVertical(trees, i, j, 1)
  ) {
    // console.log('<%d, %d>: visible', i, j);
    // console.log('    left : ', isVisibleInHorizontal(trees, i, j, -1));
    // console.log('    up   : ', isVisibleInVertical(trees, i, j, -1));
    // console.log('    right: ', isVisibleInHorizontal(trees, i, j, 1));
    // console.log('    down : ', isVisibleInVertical(trees, i, j, 1));
    return true;
  }
  return false;
}

function isVisibleInHorizontal(trees: Array<Array<number>>, i: number, j: number, dx: -1 | 1): boolean {
  const shouldLog = false;
  // const shouldLog = i === 2 && j === 2 && dx === 1;
  if (shouldLog) console.log('isVisibleInHorizontal', i, j, dx);
  const target = getTarget(i, dx, trees[0].length); // Math.abs((dx > 0 ? trees[0].length - 1 : 0) - i);
  if (shouldLog) console.log('    target: ', target);
  for (let n = 1; n < target + 1; n++) {
    const di = i + dx * n;
    if (shouldLog) console.log('    (<%d, %d>: %d) > (<%d, %d>: %d) |> ', di, j, trees[j][di], i, j, trees[j][i], trees[j][di] > trees[j][i]);
    if (trees[j][di] >= trees[j][i]) { return false; }
  }
  return true;
}

function isVisibleInVertical(trees: Array<Array<number>>, i: number, j: number, dy: -1 | 1): boolean {
  const shouldLog = false;
  // const shouldLog = i === 3 && j === 1 && dy === - 1;
  if (shouldLog) console.log('isVisibleInVertical', i, j, dy);
  const target = getTarget(j, dy, trees.length); // Math.abs((dy > 0 ? trees.length - 1 : 0) - j);
  if (shouldLog) console.log('    target: ', target);
  for (let n = 1; n < target + 1; n++) {
    const dj = j + dy * n;
    if (shouldLog) console.log('    (<%d, %d>: %d) > (<%d, %d>: %d) |> ', i, dj, trees[dj][i], i, j, trees[j][i], trees[dj][i] > trees[j][i]);
    if (trees[dj][i] >= trees[j][i]) { return false; }
  }
  return true;
}

function getTarget(idx: number, dIdx: number, dLength: number): number {
  return Math.abs((dIdx > 0 ? dLength - 1 : 0) - idx);

}
