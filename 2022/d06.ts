import { dumpResult, getInput } from "./Utils";

function findSubstring(buffer: string, length: number): number {
  for (let i = 0; i < buffer.length - length; i++) {
    if (isUniqueSubstring(buffer, i, length)) {
      // console.log('Data Start: ', i + SUBSTRING_LENGTH);
      return i + length;
    }
  }
  throw new Error("Cound not find substring of length: " + length);
}

function isUniqueSubstring(buffer: string, start: number, length: number) {
  const substr = buffer.slice(start, start + length);
  return (new Set(substr.split(''))).size === length;
}

function process() {
  const buffer = getInput(__filename);
  dumpResult("Part 1 (start of packet)", findSubstring(buffer, 4), 1892);
  dumpResult("Part 2 (start of message)", findSubstring(buffer, 14), 2313);
}

process();
