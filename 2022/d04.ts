import { dumpResult, getInput } from "./Utils";

interface Pair {
  l: number,
  r: number,
}

(function process() {
  const pairs = getInput(__filename).toString().split('\n').reduce((memo: Array<Array<Pair>>, val: string) => {
    memo.push(
      val.split(',').map(pair => {
        const p = pair.split('-');
        return { l: parseInt(p[0], 10), r: parseInt(p[1], 10) };
      })
    );
    return memo;
  }, []);
  // part 1
  const completeOverlaps = pairs.reduce((memo: Array<number>, pair, index) => {
    if (
      (pair[0].l <= pair[1].l && pair[0].r >= pair[1].r) ||
      (pair[1].l <= pair[0].l && pair[1].r >= pair[0].r)
    ) {
      memo.push(index);
    }
    return memo;
  }, []);

  // part 2
  const partialOverlaps = pairs.reduce((memo: Array<number>, pair, index) => {
    if (!(
      (pair[0].l < pair[1].l && pair[0].r < pair[1].l) ||
      (pair[0].l > pair[1].r && pair[0].r > pair[1].r)
    )) {
      memo.push(index);
    }
    return memo;
  }, []);
  dumpResult("Part 1: Overlaps", completeOverlaps.length, 580);
  dumpResult("Part 2: Partials", partialOverlaps.length, 895);
})();
