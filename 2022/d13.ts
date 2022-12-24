import * as fs from 'fs';

type PacketValue = number | Array<PacketValue>;

const CORRECT_ORDER = 1;
const UNKNOWN_ORDER = 0;
const INCORRECT_ORDER = -1;
type CompareResult = -1 | 0 | 1;

(function process() {
  const input = processInput();
  calcPartA(input);
  calcPartB(input);
})();

function calcPartA(packets: Array<PacketValue>) {
  let sum = 0;
  for (let i=0; i<packets.length; i += 2) {
    const pairIdx = i/2 + 1;
    const result = comparePacketData(packets[i], packets[i+1]);
    console.log("Pair: ", pairIdx, packets[i], packets[i+1], result);
    if (result === CORRECT_ORDER) sum += pairIdx;
  }
  console.log('Sum of Indicies: ', sum);
}

function calcPartB(packets: Array<PacketValue>) {
  const dividers = [[[2]], [[6]]];
  const sorted = packets.concat(dividers).sort(comparePacketData).reverse();
  const decoder = sorted.reduce((decoder: number, packet, idx) => {
    if (packet === dividers[0] || packet === dividers[1]) {console.log('ping: ', idx + 1); decoder *= idx + 1;}
    return decoder
  }, 1)
  console.log('sorted: ', sorted);
  console.log('decoder: ', decoder);
}

function comparePacketData(left: PacketValue, right: PacketValue): CompareResult {
  if (!Array.isArray(left) && !Array.isArray(right)) {
    return left === right ? UNKNOWN_ORDER : left < right ? CORRECT_ORDER : INCORRECT_ORDER;
  }

  if (Array.isArray(left) && !Array.isArray(right)) {
    return comparePacketData(left, [right]);
  }

  if (!Array.isArray(left) && Array.isArray(right)) {
    return comparePacketData([left], right);
  }

  // Typescript isn't smart enough to have figured this out, but
  // the logic above guarantees they are both arrays at this point.
  const leftArray = left as Array<PacketValue>;
  const rightArray = right as Array<PacketValue>;

  // both are arrays
  for (let i = 0; i < leftArray.length; i++) {
    const l = leftArray[i];
    if (i >= rightArray.length) { return INCORRECT_ORDER; }
    const r = rightArray[i];
    const subcomparisonResult = comparePacketData(l, r);
    if (subcomparisonResult !== UNKNOWN_ORDER) { return subcomparisonResult; }
  }

  return leftArray.length === rightArray.length ? UNKNOWN_ORDER : CORRECT_ORDER;
}

function processInput() {
  const packets = fs.readFileSync("./d13.input.txt").toString().split('\n').reduce((packets: Array<PacketValue>, line) => {
    if (line !== '') packets.push(JSON.parse(line));
    return packets;
  }, []);

  return packets;
}