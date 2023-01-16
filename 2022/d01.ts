import { dumpResult, getInput } from './Utils';

interface Elf {
  items: Array<number>,
  total: number,
}

(function process() {
  let maxCalories = 0;
  let i = 0;
  const store = getInput(__filename).split('\n').reduce((memo: Array<Elf>, val: string) => {
    if (val === "") {
      memo.push({items: [], total: 0});
    } else {
      const calories = parseInt(val, 10);
      memo[memo.length - 1].items.push(calories);
      memo[memo.length-1].total += calories
      if (memo[memo.length-1].total > maxCalories) {
        maxCalories = memo[memo.length-1].total;
      }
    }
    return memo;
  }, [{items: [], total: 0}]);
  dumpResult("Part 1: Max Calories", maxCalories, 72017);
  // console.log('Max Calories: ', maxCalories);
  const nbiggest = store.map((elf) => elf.total).sort().slice(-3);
  const biggest3 = nbiggest.reduce((s, v) => s += v, 0);
  dumpResult("Part 2: Biggest 3", biggest3, 212520);
})()
