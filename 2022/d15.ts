import { dumpResult, getInput } from "./Utils";

interface Point {
  x: number,
  y: number,
}
interface SensorBeaconPair {
  sensor: Point;
  beacon: Point;
  distance: number;
}
interface State {
  pairs: Array<SensorBeaconPair>
}
interface Window {
  min: number;
  max: number;
}

(function process() {
  const input = processInput();

  calcPartA(input);
  calcPartB(input);
})();

function calcPartB(state: State) {
  const searchSpace = 4000000;
  const possibleLocations = [];

  for (let y = 0; y < searchSpace; y++) {
    let x = 0;
    const isCovered = ({ sensor, distance }: SensorBeaconPair) => {
      const dy = Math.abs(y - sensor.y);
      const dx = distance - dy;
      return (x >= sensor.x - dx) && (x <= sensor.x + dx);
    }

    let coverage = state.pairs.find(isCovered);
    while (x < searchSpace && (coverage != null)) {
      const { sensor, distance } = coverage;
      const dy = Math.abs(y - sensor.y);
      const dx = distance - dy;
      x = sensor.x + dx + 1;
      coverage = state.pairs.find(isCovered);
    }
    if (x < searchSpace) {
      possibleLocations.push({ x, y });
    }
  }

  const frequency = possibleLocations[0].x * 4000000 + possibleLocations[0].y;
  dumpResult("Part 2 - frequency", frequency, 11756174628223);
}

function calcPartA(state: State) {
  const y = 2000000;
  const window = findHorizontalWindow(state);
  let sum = 0;
  const win = new Array(window.max - window.min)
    .fill(undefined)
    .map((_, idx) =>
      canSquareContainBeacon(state, { x: window.min + idx, y }) ? '.' : '#'
    );
  for (let x = window.min; x < window.max; x++) {
    if (!canSquareContainBeacon(state, { x, y })) { sum++; }
  }
  dumpResult("Part 1 - y = 2000000", sum, 5525990);
}

function canSquareContainBeacon(state: State, point: Point): boolean {
  for (let i = 0; i < state.pairs.length; i++) {
    const { sensor, beacon, distance: dBeacon } = state.pairs[i];
    if (beacon.x === point.x && beacon.y === point.y) { return true; }
    const dPoint = distanceBetween(sensor, point);
    if (dBeacon >= dPoint) return false;
  }
  return true;
}

function canSquareContainMissingBeacon(state: State, point: Point): boolean {
  for (let i = 0; i < state.pairs.length; i++) {
    const { sensor, distance: dBeacon } = state.pairs[i];
    const dPoint = distanceBetween(sensor, point);
    if (dBeacon >= dPoint) return false;
  }
  return true;
}

function isKnownBeacon(state: State, point: Point): boolean {
  return state.pairs.findIndex(({ beacon }) =>
    beacon.x === point.x && beacon.y === point.y
  ) > -1
}

function findHorizontalWindow(state: State) {
  let minX = 0;
  let maxX = 0;
  state.pairs.forEach(({ sensor, beacon }) => {
    const dist = distanceBetween(sensor, beacon);
    const dMin = sensor.x - dist;
    const dMax = sensor.x + dist;
    if (dMin < minX) { minX = dMin; }
    if (dMax > maxX) { maxX = dMax; }
  });
  return { min: minX, max: maxX };
}

function distanceBetween(a: Point, b: Point) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function processInput(): State {
  const pairs = getInput(__filename).split('\n').reduce((pairs: Array<SensorBeaconPair>, line) => {
    const [left, right] = line.split(':')
    const sensorTokens = left.split(' ');
    const beaconTokens = right.split(' ');
    const sensor = { x: parseInt(sensorTokens[2].slice(2, -1), 10), y: parseInt(sensorTokens[3].slice(2), 10) };
    const beacon = { x: parseInt(beaconTokens[5].slice(2, -1), 10), y: parseInt(beaconTokens[6].slice(2), 10) };
    pairs.push({ sensor, beacon, distance: distanceBetween(sensor, beacon) });
    return pairs;
  }, [])

  return { pairs };
}
