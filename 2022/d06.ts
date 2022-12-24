import * as fs from 'fs';

// start of packet length
// const SUBSTRING_LENGTH = 4;
// start of message
const SUBSTRING_LENGTH = 14;
(function process() {
  const buffer = fs.readFileSync("./d06.input.txt").toString();
  console.log('processing', buffer);
  for (let i = 0; i < buffer.length - SUBSTRING_LENGTH; i++) {
    if (isUniqueSubstring(buffer, i)) {
      console.log('Data Start: ', i + SUBSTRING_LENGTH);
      return;
    }
  }
})()

function isUniqueSubstring(buffer: string, start: number) {
  const substr = buffer.slice(start, start + SUBSTRING_LENGTH);
  return (new Set(substr.split(''))).size === SUBSTRING_LENGTH;
}