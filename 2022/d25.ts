import * as fs from 'fs';
import { dumpResult } from './Utils';

type Input = string[];

type SnafuDigit = '2' | '1' | '0' | '-' | '=';
function isSnafuDigit(d: string): d is SnafuDigit {
  return ['2', '1', '0', '-', '='].includes(d);
}
const SNAFU_DIGIT_VALUE = {
  '2': 2,
  '1': 1,
  '0': 0,
  '-': -1,
  '=': -2,
}

function calc(
  description: string,
  input: Input,
  expected: string | null,
) {
  const decimalResult = input.reduce((sum, snafu) => sum += snafuToDecimal(snafu), 0);
  console.log('decimal result: ', decimalResult);
  const result = decimalToSnafu(decimalResult);
  dumpResult(description, result, expected);
}

function snafuToDecimal(snafu: string): number {
  const digits = snafu.split('').filter(isSnafuDigit);
  const decimal = digits.reduce((sum, digit, idx) => (
    sum += SNAFU_DIGIT_VALUE[digit] * Math.pow(5, digits.length - idx - 1)
  ), 0)
  return decimal;
}
function decimalToSnafu(num: number): string {
  let result = '';
  let x = num;
  while (x !== 0) {
    const remainder = x % 5;
    switch (remainder) {
      case 0:
      case 1:
      case 2:
        result = remainder + result;
        break;
      case 3:
        result = '=' + result;
        x += 5;
        break;
      case 4:
        result = '-' + result;
        x += 5;
        break;
    }
    x = Math.floor(x / 5);
  }

  return result;
}

function processInput(name: string = 'input'): Input {
  return fs.readFileSync(`./d25.${name}.txt`)
    .toString()
    .split('\n');
}

function process() {
  calc('Part 1 (sample)', processInput('sample'), '2=-1=0');
  calc('Part 1', processInput(), '20-=0=02=-21=00-02=2');
  // no part 2, it just tosses the 49 stars in the blender and calls it a day...
}
process();
