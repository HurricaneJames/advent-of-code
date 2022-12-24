import * as fs from 'fs';

interface Elf {
  items: Array<number>,
  total: number,
}

(function process() {
  let maxCalories = 0;
  const input = fs.readFileSync("./d01.input.txt");
  let i = 0;
  const store = input.toString().split('\n').reduce((memo: Array<Elf>, val: string) => {
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
  console.log('Max Calories: ', maxCalories);
  const nbiggest = store.map((elf) => elf.total).sort().slice(-3);
  console.log('Biggest 3: ', nbiggest.reduce((s, v) => s += v, 0));
})()
