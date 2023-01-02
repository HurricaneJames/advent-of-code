import * as fs from 'fs';
import { dumpResult } from './Utils';

type Input = MonkeyMap;
type MonkeyMap = { [id: string]: Node }
enum Operation {
  PLUS = '+',
  MINUS = '-',
  MULTIPLY = '*',
  DIVIDE = '/',
  EQUALS = '=',
};
interface BaseNode {
  name: string,
  value: number | null,
  triggers: OperationNode[],
};
type OperationNode = BaseNode & {
  operation: Operation,
  values: { [id: string]: number },
  waitingOn: string[];
}
type Node = BaseNode | OperationNode;

function process() {
  calc1('Part 1 (sample)', processInput('sample'), 152);
  calc1('Part 1', processInput(), 331120084396440);
  calc2('Part 2 (sample)', processInput('sample'), 301);
  calc2('Part 2', processInput(),  3378273370680);
}

function calc1(
  description: string,
  monkeys: Input,
  expected: number | null,
) {
  const result = evaluate(monkeys, monkeys.root);
  dumpResult(description, result, expected);
}

function calc2(
  description: string,
  monkeys: Input,
  expected: number | null,
) {
  let node = monkeys.root as OperationNode;
  monkeys.humn.value = null;
  node.operation = Operation.EQUALS;
  const result = reverseEvaluate(monkeys, node, 0);
  dumpResult(description, result, expected);
}

function reverseEvaluate(monkeys: MonkeyMap, node: Node, value: number): number {
  if (isOperationNode(node)) {
    const leftNode = monkeys[node.waitingOn[0]];
    const rightNode = monkeys[node.waitingOn[1]]
    const left = evaluate(monkeys, leftNode);
    const right = evaluate(monkeys, rightNode);
    const unknownIsLeft = left === null;
    if (unknownIsLeft && right === null) throw new Error('cannot calculate when both sides need human input');
    const known = unknownIsLeft ? right! : left;
    const unknownNode = unknownIsLeft ? leftNode : rightNode;
    switch (node.operation) {
      case Operation.PLUS:
        return reverseEvaluate(monkeys, unknownNode, value - known);
      case Operation.MINUS:
        return reverseEvaluate(monkeys, unknownNode, unknownIsLeft ? value + known : known - value);
      case Operation.MULTIPLY:
        return reverseEvaluate(monkeys, unknownNode, value / known);
      case Operation.DIVIDE:
        return reverseEvaluate(monkeys, unknownNode, unknownIsLeft ? value * known : known / value);
      case Operation.EQUALS:
        return reverseEvaluate(monkeys, unknownNode, known);
      default:
        throw new Error('Invalid Operation: ' + node.operation);
    }
  }
  return node.value || value;
}

function evaluate(monkeys: MonkeyMap, node: Node): number | null {
  if (isOperationNode(node)) {
    const left = evaluate(monkeys, monkeys[node.waitingOn[0]]);
    if (left === null) return null;
    const right = evaluate(monkeys, monkeys[node.waitingOn[1]]);
    if (right === null) return null;
    switch (node.operation) {
      case Operation.PLUS:
        return left + right;
      case Operation.MINUS:
        return left - right;
      case Operation.MULTIPLY:
        return left * right;
      case Operation.DIVIDE:
        return left / right;
      default:
        throw new Error('Invalid Operation: ' + node.operation);
    }
  }
  return node.value;
}

function isOperationNode(node: Node): node is OperationNode {
  return Object.hasOwn(node, 'waitingOn');
}

const OPERATIONS = [Operation.PLUS, Operation.MINUS, Operation.MULTIPLY, Operation.DIVIDE];
function processInput(name: string = 'input'): Input {
  const monkeys: MonkeyMap = fs.readFileSync(`./d21.${name}.txt`).toString()
    .split('\n')
    .reduce((monkeys: MonkeyMap, line) => {
      const [name, valueOrOperation] = line.split(':');

      const value = parseInt(valueOrOperation);
      if (!isNaN(value)) {
        monkeys[name] = { name, value, triggers: [] }
        return monkeys;
      };
      for (let i = 0; i < OPERATIONS.length; i++) {
        const operation = OPERATIONS[i];
        const tokens = valueOrOperation.split(operation);
        if (tokens.length === 2) {
          const waitingOn = [tokens[0].trim(), tokens[1].trim()];
          monkeys[name] = { name, value: -1, operation, waitingOn, values: {}, triggers: [] };
          return monkeys;
        }
      }
      throw new Error('Error WIth Input, cannot process: ' + line);
    }, {});

  Object.values(monkeys).forEach(monkey => {
    if (isOperationNode(monkey)) {
      monkey.waitingOn.forEach(monkeyName => monkeys[monkeyName].triggers.push(monkey))
    }
  });

  return monkeys;
}

process();