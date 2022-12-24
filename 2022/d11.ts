import * as fs from 'fs';

const TOTAL_ROUNDS = 10000;

interface Monkey {
  id: number;
  inspections: number;
  items: Array<number>;
  operation: Array<string>;
  test: number;
  onTrue: number;
  onFalse: number;
}

(function process() {
  const input = fs.readFileSync("./d11.input.txt").toString();
  const monkeys = input.split('\n').reduce((monkeys: Array<Monkey>, line, idx) => {
    if (line === '') return monkeys;
    const tokens = line.split(':');
    if (tokens[0].startsWith('Monkey')) {
      const id = parseInt(tokens[0].split(' ')[1], 10);
      monkeys.push({
        id,
        inspections: 0,
        items: [],
        operation: [],
        test: 0,
        onTrue: 0,
        onFalse: 0,
      })
    } else if (tokens[0] === '  Starting items') {
      const items = tokens[1].split(',').map(i => parseInt(i, 10));
      monkeys[monkeys.length - 1].items = items;
    } else if (tokens[0] === '  Operation') {
      monkeys[monkeys.length - 1].operation = tokens[1].split('=')[1].trim().split(' ');

    } else if (tokens[0] === '  Test') {
      const testTokens = tokens[1].trim().split(' ');
      const test = parseInt(testTokens[2], 10);
      if (
        !tokens[1].startsWith(' divisible by') ||
        !test
      ) throw new Error("Unexpected test operation: " + testTokens)
      monkeys[monkeys.length - 1].test = test;
    } else if (tokens[0] === '    If true') {
      if (!tokens[1].startsWith(' throw to monkey ')) throw new Error(`Unexpected on true: ${tokens[1]}`);
      monkeys[monkeys.length - 1].onTrue = parseInt(tokens[1].trim().split(' ')[3], 10);
    } else if (tokens[0] === '    If false') {
      if (!tokens[1].startsWith(' throw to monkey ')) throw new Error(`Unexpected on false: ${tokens[1]}`);
      monkeys[monkeys.length - 1].onFalse = parseInt(tokens[1].trim().split(' ')[3], 10);
    } else {
      throw new Error(`Unexpected input on line ${idx}: ${line}`);
    }
    return monkeys;
  }, []);

  // at this point, worry level becomes a cycle based on the monkey test divisions
  const manageableWorryLevel = monkeys.reduce((lvl, monkey) => leastCommonMultiple(lvl, monkey.test), 1);

  for (let i = 0; i < TOTAL_ROUNDS; i++) {
    for (let monkeyId = 0; monkeyId < monkeys.length; monkeyId++) {
      const monkey = monkeys[monkeyId];
      for (let itemId = 0; itemId < monkey.items.length; itemId++) {
        const item = monkey.items[itemId];
        // const newWorry = Math.floor(processOperation(monkey.operation, item) / 3);
        const newWorry = processOperation(monkey.operation, item) % manageableWorryLevel;
        const nextMonkey = (newWorry % monkey.test === 0) ? monkey.onTrue : monkey.onFalse;
        monkeys[nextMonkey].items.push(newWorry);
        monkey.inspections++;
      }
      monkey.items = [];
    }
  }

  // console.log('Monkeys: ', monkeys);
  console.log('MonkeyBusiness: ', getMonkeyBusinessLevel(monkeys));
})();

function processOperation(operation: Array<string>, old: number) {
  const ops = operation.map(oper => {
    switch (oper) {
      case 'old':
        return old;
      case '*':
      case '+':
        return 0;
      default:
        return parseInt(oper, 10);
    }
  });
  // TODO - read in infix and convert to postfix
  // probably need this for part b
  if (operation[1] === '+') return ops[0] + ops[2];
  if (operation[1] === '*') return ops[0] * ops[2];

  throw new Error(`Cannot process Operation: ${operation}`);
}

function getMonkeyBusinessLevel(monkeys: Array<Monkey>) {
  const EMPTY_INSPECTOR_SLOT = -1;
  // could improve perf by doing binary search, but won't really help for numbers this small
  const topInspectors = (new Array(2)).fill(EMPTY_INSPECTOR_SLOT);
  for (let i = 0; i < monkeys.length; i++) {
    for (let j = 0; j < topInspectors.length; j++) {
      if (
        topInspectors[j] === EMPTY_INSPECTOR_SLOT ||
        monkeys[i].inspections > monkeys[topInspectors[j]].inspections
      ) {
        topInspectors.splice(j, 0, i);
        topInspectors.pop();
        break;
      }
    }
  }
  console.log("Top Inspectors: ", topInspectors);
  const mbl = topInspectors.reduce((sum, inspector) => sum * monkeys[inspector].inspections, 1);
  return mbl;
}

function greatestCommonDivisor(a: number, b: number): number { return (a ? greatestCommonDivisor(b % a, a) : b); }
function leastCommonMultiple(a: number, b: number) { return ((a * b) / greatestCommonDivisor(a, b)); }