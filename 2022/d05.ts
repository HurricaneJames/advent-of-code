import { dumpResult, getInput } from "./Utils";

interface Move {
  count: number,
  from: number,
  to: number,
}

interface StackMoves {
  stack: Array<Array<String>>,
  moves: Array<Move>,
}

function process() {
  dumpResult("Part 1", executeMoves(parseInput()), 'TWSGQHNHL');
  dumpResult("Part 2", executeMoves2(parseInput()), 'JNRSCDWPP');
}

function initStack(memo: StackMoves, tokens: Array<String>) {
  const stackCount = (tokens.length - 1) / 4;
  for (let i = 0; i < stackCount; i++) {
    memo.stack.push([])
  }
}

function executeMoves(memo: StackMoves): string {
  for (let i=0; i < memo.moves.length; i++) {
    const {count, from, to} = memo.moves[i];
    for (let j=0; j<count; j++) {
      let item = memo.stack[from].pop();
      if (item == null) throw new Error('no crate to move: ' + memo.moves[i]);
      try {
        memo.stack[to].push(item);
      } catch (e) {
        console.log("Caught: ", e);
        console.log("Move: ", i, memo.moves[i]);
        console.log("Current Stack: ", memo.stack);
        throw e;
      }
    }
  }
  return memo.stack.map(i => i[i.length - 1]).join('');
}

function executeMoves2(memo: StackMoves): string {
  for (let i=0; i < memo.moves.length; i++) {
    const {count, from, to} = memo.moves[i];
    const crates = memo.stack[from].splice(-count);
    memo.stack[to].push(...crates);
  }
  return memo.stack.map(i => i[i.length - 1]).join('');
}

function parseInput(): StackMoves {
  const MODEL_MODE = 0;
  const STACK_MOVE_SEPERATION_MODE = 1;
  const MOVE_MODE = 2;

  let mode = MODEL_MODE;

  return getInput(__filename).split('\n').reduce((memo: StackMoves, val: string) => {
    switch (mode) {
      case MODEL_MODE: {
        const tokens = val.split('');
        // check for mode transition
        if (tokens[1] === '1') {
          mode = STACK_MOVE_SEPERATION_MODE;
          break;
        }
        if (memo.stack.length === 0) {
          initStack(memo, tokens);
        }
        // else split and add to stacks
        for (let i = 1; i < tokens.length; i += 4) {
          if (tokens[i] !== ' ') {
            memo.stack[(i - 1) / 4].unshift(tokens[i]);
          }
        }
        break;
      }
      case STACK_MOVE_SEPERATION_MODE: {
        // check for and skip empty line
        if (val === '') {
          mode = MOVE_MODE;
          break;
        }
        throw new Error('Should only have a blank line, but got: ' + val);
      }
      case MOVE_MODE: {
        const tokens = val.split(' ');
        if (tokens.length !== 6) throw new Error('Invlaid move: ' + val);

        memo.moves.push({
          count: parseInt(tokens[1], 10),
          from: parseInt(tokens[3], 10) - 1,
          to: parseInt(tokens[5], 10) - 1,
        })
        break;
      }
    }
    return memo;
  }, {
    stack: [],
    moves: [],
  });
}

process();