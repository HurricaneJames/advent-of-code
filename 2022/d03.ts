import { dumpResult, getInput } from './Utils';

const values = [
  '',
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
];

(function process() {
  findSharedItems(getInput(__filename));
  findElfBadges(getInput(__filename));
})()

function findElfBadges(input: string) {
  const sacks = input.split('\n').map(sack => new Set(sack));
  const teamBadges = [];
  for (let i = 0; i < sacks.length; i += 3) {
    const x = intersection(intersection(sacks[i], sacks[i + 1]), sacks[i + 2]);
    if (x.size !== 1) {
      throw new Error('invalid input');
    }
    teamBadges.push([...x][0]);
  }
  const badges = teamBadges.reduce((sum, i) => sum += values.indexOf(i), 0);
  dumpResult("Part 2: Badges", badges, 2609);
}

function findSharedItems(input: string) {
  const sharedItems = input.split('\n').reduce((memo: Array<string>, val: string) => {
    const sharedItem = findSharedItem(val);
    memo.push(sharedItem);
    return memo;
  }, []);
  const result = sharedItems.reduce((sum, i) => sum += values.indexOf(i), 0);
  dumpResult("Part 1: Shared Items", result, 7727);
}

function findSharedItem(sackContents: string) {
  const a = new Set(sackContents.slice(0, sackContents.length / 2));
  const b = new Set(sackContents.slice(sackContents.length / 2));
  for (const item of [...a]) {
    if (b.has(item)) { return item; }
  }
  throw new Error('no shared items');
}

function intersection<T>(set1: Set<T>, set2: Set<T>) {
  return new Set([...set1].filter((x) => set2.has(x)));
}
