import * as fs from 'fs';

const ALPHA = 'abcdefghijklmnopqrstuvwxyz';

interface Point {
  col: number;
  row: number;
}

interface Node {
  p: Point;
  steps: number;
}

(function process() {
  const { start, end, map } = processInput();

  console.log("Steps to goal: ", search(map, start, end));
  console.log('Steps to reverse goal: ', search2(map, end, 0));
})();


function search2(map: Array<Array<number>>, start: Point, targetElevation: number, direction: number = -1) {
  const visited = new Array(map.length).fill(undefined).map(row => new Array(map[0].length).fill(false));
  visited[start.row][start.col] = true;
  const queue: Array<Node> = [{ p: start, steps: 0 }];
  while (queue.length > 0) {
    const v = queue.shift();
    if (v == null) throw new Error("Unable to find path"); // impossible since queue.lenght > 1, but typescript...
    const { p, steps } = v;
    // only difference from original search, is we are looking for the shortest path to
    // targetElevation in a direction
    if (map[p.row][p.col] === targetElevation) { return steps; }
    adjacentEdges(map, p, -1).forEach(w => {
      if (!visited[w.row][w.col]) {
        visited[w.row][w.col] = true;
        queue.push({ p: w, steps: steps + 1 });
      }
    });
  }
  console.log('Visited: ');
  console.log(visited.map(row => row.map(c => c ? '#' : '.').join('')).join('\n'));
  throw new Error("Unable to find path");

}

function search(map: Array<Array<number>>, start: Point, end: Point) {
  const visited = new Array(map.length).fill(undefined).map(row => new Array(map[0].length).fill(false));

  visited[start.row][start.col] = true;
  const queue: Array<Node> = [{ p: start, steps: 0 }];
  while (queue.length > 0) {
    const v = queue.shift();
    if (v == null) throw new Error("Unable to find path"); // impossible since queue.lenght > 1, but typescript...
    const { p, steps } = v;
    if (p.row === end.row && p.col === end.col) { return steps; }
    adjacentEdges(map, p, 1).forEach(w => {
      if (!visited[w.row][w.col]) {
        visited[w.row][w.col] = true;
        queue.push({ p: w, steps: steps + 1 });
      }
    });
  }
  console.log('Visited: ');
  console.log(visited.map(row => row.map(c => c ? '#' : '.').join('')).join('\n'));
  throw new Error("Unable to find path");
}

function adjacentEdges(map: Array<Array<number>>, p: Point, direction: number): Array<Point> {
  const adjacent = [];
  const height = map[p.row][p.col];
  if (p.col > 0 && direction * (map[p.row][p.col - 1] - height) <= 1) {
    adjacent.push({ row: p.row, col: p.col - 1 });
  }
  if (p.col + 1 < map[0].length && direction * (map[p.row][p.col + 1] - height) <= 1) {
    adjacent.push({ row: p.row, col: p.col + 1 });
  }
  if (p.row > 0 && direction * (map[p.row - 1][p.col] - height) <= 1) {
    adjacent.push({ row: p.row - 1, col: p.col });
  }
  if (p.row + 1 < map.length && direction * (map[p.row + 1][p.col] - height) <= 1) {
    adjacent.push({ row: p.row + 1, col: p.col });
  }
  return adjacent;
}

function processInput() {
  const input = fs.readFileSync("./d12.input.txt").toString();
  const start = { row: 0, col: 0 };
  const end = { row: 0, col: 0 };
  const map = input.split('\n').reduce((map: Array<Array<number>>, line, rowIdx) => {
    const cols = line.split('').map((height, colIdx) => {
      if (height === 'S') {
        start.row = rowIdx;
        start.col = colIdx;
        return ALPHA.indexOf('a');
      }
      if (height === 'E') {
        end.row = rowIdx;
        end.col = colIdx;
        return ALPHA.indexOf('z');
      }
      return ALPHA.indexOf(height);
    });
    map.push(cols);
    return map;
  }, []);
  return { start, end, map };
}
