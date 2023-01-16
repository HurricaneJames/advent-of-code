import { dumpResult, getInput } from './Utils';

type Input = number[];

const DECRYPTION_KEY = 811589153;
const ITERATIONS = 10;
function process() {
  calc('Part 1 (sample)', processInput('sample'), 1, 1, 3);
  calc('Part 1', processInput(), 1, 1, 872);
  calc('Part 2 (sample)', processInput('sample'), DECRYPTION_KEY, ITERATIONS, 1623178306);
  calc('Part 2', processInput(), DECRYPTION_KEY, ITERATIONS, 5382459262696);
}

function calc(description: string, data: Input, decryptionKey: number, iterations: number, expected: number | null) {

  const mixed = data.map((n, idx) => ({ n: n * decryptionKey, idx }));
  const length = mixed.length;

  for (let iteration = 0; iteration < iterations; iteration++) {
    data.forEach((_, idx) => {
      const i = mixed.findIndex(d => d.idx === idx);
      const removed = mixed.splice(i, 1)[0];

      if (removed.n === -i) {
        mixed.push(removed);
      } else {
        const a = i + removed.n;
        const b = length - 1;
        const di = ((a % b) + b) % b;
        mixed.splice(di, 0, removed);
      }
    });
  }

  const zeroIdx = mixed.findIndex(d => d.n === 0);
  const resultsIdx = [1000, 2000, 3000];
  const results = resultsIdx.map(resultIdx => mixed[(zeroIdx + resultIdx) % length]);
  const result = results.reduce((sum, i) => sum + i.n, 0);
  dumpResult(description, result, expected);
}

function processInput(name: string = 'input'): Input {
  return getInput(__filename, name)
    .split('\n')
    .map(n => parseInt(n, 10));
}

process();