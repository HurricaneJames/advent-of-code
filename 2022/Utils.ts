
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
