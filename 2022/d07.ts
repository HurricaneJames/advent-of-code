import * as fs from 'fs';

interface FsNode {
  name: string,
  size: number,
  type: 'dir' | 'file',
  parent: FsNode | null,
  children: Array<FsNode>,
}

interface ShellState {
  fileSystem: FsNode,
  activeDirectory: FsNode,
}

const NOT_CALCULATED = -1;
const TOTAL_DISK_SPACE = 70000000;
const MIN_UNUSED_SPACE = 30000000;

(function process() {
  const rootNode: FsNode = {
    name: '/',
    size: NOT_CALCULATED,
    parent: null,
    type: 'dir',
    children: [],
  };
  const input = fs.readFileSync("./d07.input.txt").toString();
  const shellState = input.split('\n').reduce((state: ShellState, val: string) => {
    const tokens = val.split(' ');
    if (tokens[0] === '$') {
      processCommand(state, tokens);
    } else {
      if (tokens[0] === 'dir') {
        makeDir(state, tokens[1]);
      } else {
        makeFile(state, tokens[1], parseInt(tokens[0], 10));
      }
    }
    return state;
  }, { fileSystem: rootNode, activeDirectory: rootNode });
  calculateSizes(rootNode);

  console.log('SumOfMax100k', findAllDirectories(shellState.fileSystem, 100000).reduce((sum, d) => sum + d.size, 0));

  const requiredSpace = MIN_UNUSED_SPACE - (TOTAL_DISK_SPACE - shellState.fileSystem.size);
  if (requiredSpace <= 0) {
    console.log("No Deletions Required");
    return;
  }

  const smallestDirThatIsBigEnough = findSmallestDirectoryAboveMinSize(shellState.fileSystem, requiredSpace);
  console.log("Directory: ", smallestDirThatIsBigEnough?.size);
})()

function findAllDirectories(node: FsNode, maxSize: number) {
  if (node.type !== 'dir') return [];

  const dirs = node.children.reduce((memo: Array<FsNode>, child: FsNode) => {
    memo.push(...findAllDirectories(child, maxSize));
    return memo;
  }, [])
  if (node.size < maxSize) {
    dirs.unshift(node);
  }
  return dirs;
}

function calculateSizes(node: FsNode) {
  if (node.size === NOT_CALCULATED) {
    node.size = node.children.reduce((sum, child) => sum + calculateSizes(child), 0);
  }
  return node.size;
}

function processCommand(state: ShellState, tokens: Array<string>) {
  switch (tokens[1]) {
    case 'cd':
      const newDirName = tokens[2];
      if (newDirName === '/') {
        state.activeDirectory = state.fileSystem;
        return;
      }
      if (newDirName === '..') {
        const parent = state.activeDirectory.parent;
        if (parent == null) throw new Error("cannot cd .. on root");
        state.activeDirectory = parent;
        return;
      }
      const dirId = state.activeDirectory.children.findIndex(node => node.name === newDirName && node.type === 'dir');
      if (dirId >= 0) {
        state.activeDirectory = state.activeDirectory.children[dirId];
        return;
      }

      state.activeDirectory = makeDir(state, newDirName);

    case 'ls':
    // ignore
  }
}

function makeDir(state: ShellState, newDirName: string) {
  const newDirectory: FsNode = {
    name: newDirName,
    size: NOT_CALCULATED,
    type: 'dir',
    parent: state.activeDirectory,
    children: [],
  };
  state.activeDirectory.children.push(newDirectory);
  return newDirectory;
}

function makeFile(state: ShellState, name: string, size: number) {
  state.activeDirectory.children.push({
    name,
    size,
    type: 'file',
    parent: state.activeDirectory,
    children: [],
  })
}

function findSmallestDirectoryAboveMinSize(node: FsNode, requiredSpace: number): FsNode | null {
  if (node.type !== 'dir' || node.size < requiredSpace) return null;
  return node.children.reduce((smallest: FsNode, child: FsNode) => {
    const possibleSmallest = findSmallestDirectoryAboveMinSize(child, requiredSpace);
    if (possibleSmallest != null && possibleSmallest.size < smallest.size) {
      return possibleSmallest;
    }
    return smallest;
  }, node)
}