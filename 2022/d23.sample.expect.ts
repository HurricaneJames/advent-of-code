import { State, isTile, Direction, } from './d23';

let expected: State[] | null = null;
export function getExpectedSampleStates(): State[] {
  return expected || genExpected();
}

function genExpected(): State[] {
  return [
    {
      positions: [
        '...........'.split('').filter(isTile),
        '......#....'.split('').filter(isTile),
        '....#...#..'.split('').filter(isTile),
        '..#..#.#...'.split('').filter(isTile),
        '......#..#.'.split('').filter(isTile),
        '...#.#.##..'.split('').filter(isTile),
        '.#..#.#....'.split('').filter(isTile),
        '.#.#.#.##..'.split('').filter(isTile),
        '...........'.split('').filter(isTile),
        '...#..#....'.split('').filter(isTile),
        '...........'.split('').filter(isTile),
      ],
      directionList: [Direction.DOWN, Direction.LEFT, Direction.RIGHT, Direction.UP],
    }, {
      positions: [
        '.............'.split('').filter(isTile),
        '.......#.....'.split('').filter(isTile),
        '....#.....#..'.split('').filter(isTile),
        '...#..#.#....'.split('').filter(isTile),
        '.......#...#.'.split('').filter(isTile),
        '...#..#.#....'.split('').filter(isTile),
        '.#...#.#.#...'.split('').filter(isTile),
        '.............'.split('').filter(isTile),
        '..#.#.#.##...'.split('').filter(isTile),
        '....#..#.....'.split('').filter(isTile),
        '.............'.split('').filter(isTile),
      ],
      directionList: [Direction.LEFT, Direction.RIGHT, Direction.UP, Direction.DOWN],
    }, {
      positions: [
        '.............'.split('').filter(isTile),
        '.......#.....'.split('').filter(isTile),
        '.....#....#..'.split('').filter(isTile),
        '..#..#...#...'.split('').filter(isTile),
        '.......#...#.'.split('').filter(isTile),
        '...#..#.#....'.split('').filter(isTile),
        '.#..#.....#..'.split('').filter(isTile),
        '.......##....'.split('').filter(isTile),
        '..##.#....#..'.split('').filter(isTile),
        '...#.........'.split('').filter(isTile),
        '.......#.....'.split('').filter(isTile),
        '.............'.split('').filter(isTile),
      ],
      directionList: [Direction.RIGHT, Direction.UP, Direction.DOWN, Direction.LEFT],
    }, {
      positions: [
        '.............'.split('').filter(isTile),
        '.......#.....'.split('').filter(isTile),
        '......#....#.'.split('').filter(isTile),
        '..#...##.....'.split('').filter(isTile),
        '...#.....#.#.'.split('').filter(isTile),
        '.........#...'.split('').filter(isTile),
        '.#...###..#..'.split('').filter(isTile),
        '..#......#...'.split('').filter(isTile),
        '....##....#..'.split('').filter(isTile),
        '....#........'.split('').filter(isTile),
        '.......#.....'.split('').filter(isTile),
        '.............'.split('').filter(isTile),
      ],
      directionList: [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT],
    }, {
      positions: [
        '.......#.....'.split('').filter(isTile),
        '.............'.split('').filter(isTile),
        '..#..#.....#.'.split('').filter(isTile),
        '.........#...'.split('').filter(isTile),
        '......##...#.'.split('').filter(isTile),
        '.#.#.####....'.split('').filter(isTile),
        '...........#.'.split('').filter(isTile),
        '....##..#....'.split('').filter(isTile),
        '..#..........'.split('').filter(isTile),
        '..........#..'.split('').filter(isTile),
        '....#..#.....'.split('').filter(isTile),
        '.............'.split('').filter(isTile),
      ],
      directionList: [Direction.DOWN, Direction.LEFT, Direction.RIGHT, Direction.UP],
    }, {
      positions: [],
      directionList: [Direction.DOWN, Direction.LEFT, Direction.RIGHT, Direction.UP],
    }, {
      positions: [],
      directionList: [Direction.DOWN, Direction.LEFT, Direction.RIGHT, Direction.UP],
    }, {
      positions: [],
      directionList: [Direction.DOWN, Direction.LEFT, Direction.RIGHT, Direction.UP],
    }, {
      positions: [],
      directionList: [Direction.DOWN, Direction.LEFT, Direction.RIGHT, Direction.UP],
    }, {
      positions: [
        '......#.....'.split('').filter(isTile),
        '..........#.'.split('').filter(isTile),
        '.#.#..#.....'.split('').filter(isTile),
        '.....#......'.split('').filter(isTile),
        '..#.....#..#'.split('').filter(isTile),
        '#......##...'.split('').filter(isTile),
        '....##......'.split('').filter(isTile),
        '.#........#.'.split('').filter(isTile),
        '...#.#..#...'.split('').filter(isTile),
        '............'.split('').filter(isTile),
        '...#..#..#..'.split('').filter(isTile),
      ],
      directionList: [Direction.LEFT, Direction.RIGHT, Direction.UP, Direction.DOWN],
    }, {
      positions: [],
      directionList: [Direction.DOWN, Direction.LEFT, Direction.RIGHT, Direction.UP],
    }, {
      positions: [],
      directionList: [Direction.DOWN, Direction.LEFT, Direction.RIGHT, Direction.UP],
    }, {
      positions: [],
      directionList: [Direction.DOWN, Direction.LEFT, Direction.RIGHT, Direction.UP],
    }, {
      positions: [],
      directionList: [Direction.DOWN, Direction.LEFT, Direction.RIGHT, Direction.UP],
    }, {
      positions: [],
      directionList: [Direction.DOWN, Direction.LEFT, Direction.RIGHT, Direction.UP],
    }, {
      positions: [],
      directionList: [Direction.DOWN, Direction.LEFT, Direction.RIGHT, Direction.UP],
    }, {
      positions: [],
      directionList: [Direction.DOWN, Direction.LEFT, Direction.RIGHT, Direction.UP],
    }, {
      positions: [],
      directionList: [Direction.DOWN, Direction.LEFT, Direction.RIGHT, Direction.UP],
    }, {
      positions: [],
      directionList: [Direction.DOWN, Direction.LEFT, Direction.RIGHT, Direction.UP],
    }, {
      positions: [
        '................'.split('').filter(isTile),
        '........#.......'.split('').filter(isTile),
        '.....#......#...'.split('').filter(isTile),
        '...#.....#......'.split('').filter(isTile),
        '.......#........'.split('').filter(isTile),
        '....#....#.#..#.'.split('').filter(isTile),
        '.#..............'.split('').filter(isTile),
        '.....#.....#....'.split('').filter(isTile),
        '...#.....#......'.split('').filter(isTile),
        '.....#.#....#...'.split('').filter(isTile),
        '..........#.....'.split('').filter(isTile),
        '.....#......#...'.split('').filter(isTile),
        '........#.......'.split('').filter(isTile),
        '................'.split('').filter(isTile),
      ],
      directionList: [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT],
    },
  ];
}