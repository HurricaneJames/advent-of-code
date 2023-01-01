import * as fs from 'fs';
import { dumpResult } from './Utils';

// TODO - add optimization to calculate the max number of each robot type to bother
// checking for (that optimization is more general than greedy-geode)

interface Input {
  blueprints: Blueprint[],
}
interface Blueprint {
  id: number;
  maxOreToHoard: number;
  ore: number;    // ore required to make ore robot
  clay: number;   // ore required to make clay robot
  obsidian: { ore: number, clay: number };  // ore/clay required to make obsidian robot
  geode: { ore: number, obsidian: number }; // ore/obsidian required to make geode robot
}
interface RobotResourceState {
  ore: number;
  clay: number;
  obsidian: number;
  geode: number;
};
interface State {
  blueprint: Blueprint;
  robots: RobotResourceState;
  resources: RobotResourceState;
  remainingTime: number;
}

function process() {
  qualityLevel('Part 1 (sample)', processInput('sample'), 24, 33);
  qualityLevel('Part 1', processInput(), 24, 1958);
  multiplyFirst3('Part 2 (sample)', processInput('sample'), 32, 3472);
  multiplyFirst3('Part 2', processInput(), 32, 4257);
}

function qualityLevel(description: string, { blueprints }: Input, processingTime: number, expected: number | null) {
  const result = blueprints.reduce((sum, blueprint) =>
    sum + blueprint.id * findMaxGeodes(
      {
        blueprint,
        robots: { ore: 1, clay: 0, obsidian: 0, geode: 0 },
        resources: { ore: 0, clay: 0, obsidian: 0, geode: 0 },
        remainingTime: processingTime,
      },
    ), 0);
  dumpResult(description, result, expected);
}

function multiplyFirst3(description: string, { blueprints }: Input, processingTime: number, expected: number | null) {
  const result = blueprints.slice(0, 3).reduce((sum, blueprint, idx) => (
    sum * findMaxGeodes(
      {
        blueprint,
        robots: { ore: 1, clay: 0, obsidian: 0, geode: 0 },
        resources: { ore: 0, clay: 0, obsidian: 0, geode: 0 },
        remainingTime: processingTime,
      },
    )
  ), 1);
  dumpResult(description, result, expected);

}


function findMaxGeodes(state: State): number {
  return findBestFromState(state, {});
}

function hash({ blueprint, robots, resources, remainingTime }: State): number {
  const maxResOre = blueprint.maxOreToHoard;
  const maxResClay = blueprint.obsidian.clay;
  const maxResObsidian = blueprint.geode.obsidian;
  const maxResGeodes = 100;
  const maxRobots = 16;
  const resourceKey = (
    resources.ore +
    resources.clay * maxResOre +
    resources.obsidian * maxResOre * maxResClay +
    resources.geode
  );
  const robotKey = (
    robots.geode +
    robots.obsidian * maxRobots +
    robots.clay * Math.pow(2, maxRobots) +
    robots.ore * Math.pow(3, maxRobots)
  );
  return (
    remainingTime +
    robotKey * 32 +
    resourceKey * Math.pow(4, maxRobots)
  );
  // OLD string based hash was a bit slow for part 2
  // const resourceKey = resources.obsidian + resources.clay * blueprint.obsidian.clay + resources.ore * blueprint.obsidian.clay * blueprint.maxOreToHoard;
  // const robotKey = robots.ore * Math.pow(3, 12) +
  // robots.clay * Math.pow(2, 12) +
  // robots.obsidian * 12 +
  // robots.geode
  // return (
  //   // original all string based approach worked for part 1, but really slow
  //   // Object.values(robots).join(' ') +
  //   //  Object.values(resources).join(' ') +
  //   robotKey.toString() + ' ' +
  //   resourceKey.toString() + ' ' +
  //   remainingTime.toString()
  // );
}

type Cache = { [id: string]: number };
function findBestFromState(state: State, cache: Cache): number {
  const stateKey = hash(state);
  const cachedValue = cache[stateKey]
  if (cachedValue != null) return cachedValue;

  if (state.remainingTime === 0) return state.resources.geode;
  const { blueprint, resources, robots } = state;

  let maxGeodes: number[] = [];
  if (
    resources.ore >= blueprint.geode.ore &&
    resources.obsidian >= blueprint.geode.obsidian
  ) {
    // this optimization works for the inputs in the advent of code,
    // but probably won't work in general
    const newState = cloneState(state);
    newState.resources.ore -= blueprint.geode.ore;
    newState.resources.obsidian -= blueprint.geode.obsidian;
    gatherResources(newState);
    newState.robots.geode++;
    newState.remainingTime--;
    maxGeodes.push(findBestFromState(newState, cache));
  } else {
    if (
      resources.ore >= blueprint.obsidian.ore &&
      resources.clay >= blueprint.obsidian.clay
    ) {
      const newState = cloneState(state);
      newState.resources.ore -= blueprint.obsidian.ore;
      newState.resources.clay -= blueprint.obsidian.clay;
      gatherResources(newState);
      newState.robots.obsidian++;
      newState.remainingTime--;
      maxGeodes.push(findBestFromState(newState, cache));
    }

    if (resources.ore >= blueprint.ore) {
      const newState = cloneState(state);
      newState.resources.ore -= blueprint.ore;
      gatherResources(newState);
      newState.robots.ore++;
      newState.remainingTime--;
      maxGeodes.push(findBestFromState(newState, cache));
    }

    if (resources.ore >= blueprint.clay) {
      const newState = cloneState(state);
      newState.resources.ore -= blueprint.clay;
      gatherResources(newState);
      newState.robots.clay++;
      newState.remainingTime--;
      maxGeodes.push(findBestFromState(newState, cache));
    }

    if (resources.ore < blueprint.maxOreToHoard) {
      const newState = cloneState(state);
      gatherResources(newState);
      newState.remainingTime--;
      maxGeodes.push(findBestFromState(newState, cache));
    }

  }

  const result = Math.max(...maxGeodes);
  cache[stateKey] = result;
  return result;
}

function cloneState({ blueprint, resources, robots, remainingTime }: State): State {
  return {
    blueprint,
    robots: { ...robots },
    resources: { ...resources },
    remainingTime: remainingTime,
  };
}

function gatherResources(state: State) {
  state.resources.ore += state.robots.ore;
  state.resources.clay += state.robots.clay;
  state.resources.obsidian += state.robots.obsidian;
  state.resources.geode += state.robots.geode;
}

function processInput(name: string = 'input'): Input {
  const blueprints = fs.readFileSync(`./d19.${name}.txt`).toString().split('\n').reduce(
    (blueprints: Blueprint[], blueprint) => {
      const regex = /[^:]*:[^\d]*(?<ore>\d*)[^\d]*(?<clay>\d*)[^\d]*(?<obsidianOre>\d*)[^\d]*(?<obsidianClay>\d*)[^\d]*(?<geodeOre>\d*)[^\d]*(?<geodeObsidian>\d*).*$/;
      const tokens = blueprint.match(regex);
      const groups = tokens!.groups!;
      const [ore, clay, obsidianClay, obsidianOre, geodeOre, geodeObsidian] = [
        parseInt(groups.ore, 10),
        parseInt(groups.clay, 10),
        parseInt(groups.obsidianClay, 10),
        parseInt(groups.obsidianOre, 10),
        parseInt(groups.geodeOre, 10),
        parseInt(groups.geodeObsidian, 10),
      ];
      blueprints.push({
        id: blueprints.length + 1,
        maxOreToHoard: Math.max(ore, clay, obsidianOre, geodeOre),
        ore,
        clay,
        obsidian: {
          ore: obsidianOre,
          clay: obsidianClay,
        },
        geode: {
          ore: geodeOre,
          obsidian: geodeObsidian,
        },
      });
      return blueprints;
    },
    [],
  );
  return { blueprints };
}

process();