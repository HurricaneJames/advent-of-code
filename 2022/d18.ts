import * as fs from 'fs';
import { dumpResult } from './Utils';

type Input = { blob: Blob, cubes: Point3[] };
enum Cell {
  EMPTY = 0,
  SOLID = 1,
  LIQUID = 2,
}
type Blob = Cell[][][];
type Point3 = { x: number, y: number, z: number };

const CellMap = {
  [Cell.EMPTY]: '.',
  [Cell.SOLID]: '#',
  [Cell.LIQUID]: '@',
};

function process() {
  calc('Part 1 (sample)', processInput('sample'), true, 64);
  calc('Part 2 (sample)', processInput('sample'), false, 58);
  calc('Part 1 (sample2)', processInput('sample2'), true, 80);
  calc('Part 1 (sample2)', processInput('sample2'), false, 70);
  calc('Part 1', processInput(), true, 4636);
  calc('Part 2', processInput(), false, 2572);
}

function calc(description: string, { blob, cubes }: Input, countInclusions: boolean, expected: number | null) {
  if (!countInclusions) fillInclusions(blob);

  const shouldDebug = false;
  if (shouldDebug) dump(blob);

  const result = cubes.reduce((sum, cube) => (
    sum + countExposedSides(blob, cube, countInclusions ? Cell.EMPTY : Cell.LIQUID)
  ), 0);

  if (shouldDebug) dump(blob);
  dumpResult(description, result, expected);
}

function dump(blob: Blob) {
  console.log(blob.map(xaxis => xaxis.map(yaxis => yaxis.map(z => CellMap[z]).join('')).join(' ')).join('\n'));
}

function fillInclusions(blob: Blob) {
  const queue: Point3[] = [{ x: 0, y: 0, z: 0 }]
  while (queue.length > 0) {
    const point = queue.pop()!;
    blob[point.x][point.y][point.z] = Cell.LIQUID;
    forEachExposed(blob, point, Cell.EMPTY, p => queue.push(p));
  }
}

type ForEachExposedFn = (point: Point3) => {};
function forEachExposed(cubes: Blob, point: Point3, exposure: Cell, lambda: ForEachExposedFn) {
  const X = cubes.length - 1;
  const Y = cubes[0].length - 1;
  const Z = cubes[0][0].length - 1;
  if (point.x > 0 && cubes[point.x - 1][point.y][point.z] === exposure) lambda({ x: point.x - 1, y: point.y, z: point.z });
  if (point.x < X && cubes[point.x + 1][point.y][point.z] === exposure) lambda({ x: point.x + 1, y: point.y, z: point.z });
  if (point.y > 0 && cubes[point.x][point.y - 1][point.z] === exposure) lambda({ x: point.x, y: point.y - 1, z: point.z });
  if (point.y < Y && cubes[point.x][point.y + 1][point.z] === exposure) lambda({ x: point.x, y: point.y + 1, z: point.z });
  if (point.z > 0 && cubes[point.x][point.y][point.z - 1] === exposure) lambda({ x: point.x, y: point.y, z: point.z - 1 });
  if (point.z < Z && cubes[point.x][point.y][point.z + 1] === exposure) lambda({ x: point.x, y: point.y, z: point.z + 1 });
}
function countExposedSides(cubes: Blob, point: Point3, exposedTo: Cell) {
  let count = 0;
  forEachExposed(cubes, point, exposedTo, _ => count++);
  return count;
}

function processInput(name: string = 'input'): Input {
  const cubes = fs.readFileSync(`./d18.${name}.txt`).toString()
    .split('\n')
    .map(cube => (cube.split(',').reduce(
      (cube, n, idx) => {
        let value = parseInt(n, 10) + 1;
        switch (idx) {
          case 0:
            cube.x = value;
            break;
          case 1:
            cube.y = value;
            break;
          case 2:
            cube.z = value;
            break;
        }
        return cube;
      },
      { x: 0, y: 0, z: 0 },
    )));

  const axisLengths = findMaxPerAxis(cubes);
  const blobBase: Blob = new Array(axisLengths.x + 2).fill(undefined)
    .map(_ => new Array(axisLengths.y + 2).fill(undefined)
      .map(_ => new Array(axisLengths.z + 2).fill(Cell.EMPTY))
    );
  const blob: Blob = cubes.reduce((blob, cube) => {
    blob[cube.x][cube.y][cube.z] = Cell.SOLID;
    return blob;
  }, blobBase);

  return { blob, cubes };
}

function findMaxPerAxis(cubes: Point3[]): Point3 {
  const maxAxis = cubes.reduce((max, cube) => (
    {
      x: Math.max(max.x, cube.x),
      y: Math.max(max.y, cube.y),
      z: Math.max(max.z, cube.z),
    }
  ), { x: 0, y: 0, z: 0 });
  return maxAxis;
}

process();