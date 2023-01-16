import * as fs from 'fs';

type FnEvalsToBool<T> = (t: T, index: number, array: T[]) => boolean;
export function findLastIndex<T>(arr: T[], lambda: FnEvalsToBool<T>): number {
  let i = arr.length - 1;
  while (i >= 0) {
    if (lambda(arr[i], i, arr)) return i;
    i--;
  }
  return -1;
}

// returns real modulo, not just the remainder (useful for circular indexing)
export function modulo(a: number, b: number): number {
  return ((a % b) + b) % b;
}

export function multiplex<T>(items: Array<Array<T>>): Array<Array<T>> {
  if (items.length === 1) { return items[0].map(i => [i]); }
  return items[0].flatMap(item => subMultiplex(item, items.slice(1)))
}

function subMultiplex<T>(item: T, items: Array<Array<T>>): Array<Array<T>> {
  if (items.length === 1) return items[0].map(i => [i, item]);
  const nextOptionSet = items[0].flatMap(item => subMultiplex(item, items.slice(1)));
  nextOptionSet.forEach(os => os.push(item));
  return nextOptionSet;
}

export function getInput(filename: string, input: string = 'input'): string {
  const scriptName = filename.match(/.*\/(?<scriptName>d\d\d).ts$/)?.groups?.scriptName;
  if (scriptName == null) throw new Error("Unable to find script name for " + filename);
  return fs.readFileSync(`./input/${scriptName}.${input}.txt`).toString();
}

export function getResultMark<T>(result: T, expected: T | null): string {
  return expected == null
  ? '❓'
  : ((result === expected)
    ? '✅'
    : '❌'
  );
}
export function dumpResult<T>(description: string, result: T, expected: T | null) {
  let resultMark = getResultMark(result, expected)

  console.log(
    '%s (%s): got %o / expected %o',
    resultMark,
    description,
    result,
    expected,
  );

}
