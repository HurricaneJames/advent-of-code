// This day is probably one of the worst possible cases for a JS solution to an AOC
// problem. In fact, it is not possible to run this all the way through without
// telling node to allow more memory. Even then, it will take approximately an hour.
// To run this code
// ```
// pnpm run d16
// ```

import * as fs from 'fs';
import { dumpResult, multiplex } from './Utils';

interface Input {
  nodes: NodeMap;
  valves: ValveState;
  startNode: string;
}

// This result type allows tracking path, but it uses too much memory for
// part 2 of the question.
// type Result = { value: number, path: Array<string> };
type Result = number;
type Table = Array<Array<Result>>;
type NodeMap = { [id: string]: Node };
type ValveState = { [id: string]: number };

interface Node {
  valve: string,
  valveIdx: number,
  flowRate: number,
  adjacent: Array<string>,
}

interface State {
  locations: Array<string>;
  valves: ValveState;
  remainingTime: number;
}

(function process() {
  calc('Part 1 (sample)', processInput('sample'), 30, 1, 1651);
  calc('Part 2 (sample)', processInput('sample'), 26, 2, 1707);
  calc('Part 1', processInput(), 30, 1, 1896);
  calc('Part 2', processInput(), 26, 2, 2576);


  function calc(
    description: string,
    { startNode, valves, nodes }: Input,
    time: number,
    simultaneousLocations: number,
    expected: number | null = null,
  ) {
    const state: State = {
      locations: new Array(simultaneousLocations).fill(undefined).map(_ => startNode),
      remainingTime: time,
      valves: valves,
    };

    const mapConstants = calcMapConstants(time, nodes, state.locations.length, state.valves);
    const memo: Table = (new Array(time + 1)).fill(undefined).map(_ => new Array(mapConstants.tableSize).fill(undefined));

    const result = calcBestValueForState(state, memo, nodes, mapConstants);
    dumpResult(description, result, expected);
  }

  function calcBestValueForState(
    state: State,
    memo: Table,
    nodes: NodeMap,
    mapConstants: MapConstants,
  ): Result {
    const time = state.remainingTime;
    const tickPressure = getPressureInOneTick(state, nodes);
    if (state.remainingTime === 0) {
      return 0;
      // return { value: 0, path: state.locations };
    }

    const key = getStateHash(state, nodes, mapConstants);
    if (memo[time][key] != null) {
      return memo[time][key];
    }

    const nextStates = getNextStates(state, nodes);

    let best: Result = 0;
    // let best: Result = { value: 0, path: new Array(state.locations.length).fill('') };
    // let bestIdx = 0;

    for (let i = 0; i < nextStates.length; i++) {
      const subResult = calcBestValueForState(nextStates[i], memo, nodes, mapConstants);
      if (subResult > best) {
        best = subResult;
      }
      // if (subResult.value > best.value) {
      //   best = subresult;
      //   bestIdx = i;
      // }
    }

    return memo[time][key] = tickPressure + best;
    // return memo[time][key] = {
    //   value: tickPressure + best.value,
    //   path: best.path.map((path, idx) => (
    //     state.locations[idx] === nextStates[bestIdx].locations[idx]
    //       ? (path.slice(0, 2) + '++' + path.slice(2))
    //       : (state.locations[idx] + path)),
    //   )
    // };
  }

  interface MapConstants {
    locations: number,
    valves: number,
    valveBase: number,
    tableSize: number,
  }
  function calcMapConstants(time: number, nodes: NodeMap, simultaneousLocations: number, valves: ValveState): MapConstants {
    const controls = Object.keys(valves).length;
    const locations = Object.keys(nodes).length;
    const valveBase = Math.pow(locations, simultaneousLocations);
    const tableSize = Math.pow(2, controls) * valveBase;

    return {
      valves: controls,
      locations,
      valveBase,
      tableSize,
    };
  }

  function getStateHash(state: State, nodes: NodeMap, mapConstants: MapConstants): number {
    const positionIdx = state.locations.reduce(
      (sum, loc, idx) => sum += (nodes[loc].valveIdx * Math.pow(mapConstants.locations, idx)),
      0,
    );
    const valveIdx = Object.keys(state.valves).reduce((sum, valve, idx) =>
      sum += (state.valves[valve] > 0 ? Math.pow(2, idx) : 0),
      0,
    );

    return (
      valveIdx * mapConstants.valveBase +
      positionIdx
    );
  }

  function getPressureInOneTick(state: State, nodes: NodeMap): number {
    return Object.keys(state.valves).reduce(
      (sum: number, valve) => (isValveOpen(state.valves, valve) ? (sum + nodes[valve].flowRate) : sum),
      0,
    );
  }

  function getNextStates(state: State, nodes: NodeMap): Array<State> {
    const optionSets = calculateOptions(nodes, state);
    return optionSets.map(options => applyOptionChain(state, options, nodes)).filter((state): state is State => !!state);
  }

  type Action = 'move' | 'switch';
  interface Option {
    actor: number,
    action: Action;
    target: string;
  };
  function calculateOptions(nodes: NodeMap, { locations, valves, remainingTime }: State): Array<Array<Option>> {
    // TODO[optimization]:
    // Pre-calculate all nodes with valves that are reachable from any node with a valve.
    // Stop if there are no options that lead to a switch being turned on for any position
    // in the locations array. If at least one position still has a node, return a single
    // random option for any positions that have no available options. That way it keeps
    // cycling, but not wasting compute on even more states that won't yield any value.
    //
    // TODO[optimization]:
    // Remove all nodes with 0 flow and add step calculating into
    // options and value calculations. This reduces the problem space significantly with
    // known inputs.
    const options: Array<Array<Option>> = [];
    for (let i = 0; i < locations.length; i++) {
      const location = locations[i];
      const locationOptions: Array<Option> = [];
      options.push(locationOptions);
      const node = nodes[location];
      if (node.flowRate > 0 && !isValveOpen(valves, node.valve)) {
        locationOptions.push({
          actor: i,
          action: 'switch',
          target: location, // ignored anyway
        });
      }
      node.adjacent.forEach(next => {
        locationOptions.push({
          actor: i,
          action: 'move',
          target: next,
        });
      });
    }
    return multiplex(options);
  }

  function applyOptionChain(state: State, options: Array<Option>, nodes: NodeMap): State | null {
    const newState: State = {
      locations: state.locations.slice(),
      valves: { ...state.valves },
      remainingTime: state.remainingTime - 1,
    };
    for (let i = 0; i < options.length; i++) {
      if (mutateStateWithOption(newState, options[i], nodes) === null) {
        return null;
      }
    }
    return newState;
  }
  // mutates in place and returns for potential chaining
  function mutateStateWithOption(state: State, option: Option, nodes: NodeMap): State | null {
    switch (option.action) {
      case 'move':
        state.locations[option.actor] = option.target;
        break;
      case 'switch':
        if (isValveOpen(state.valves, option.target)) return null;
        state.valves[option.target] = state.remainingTime;
        break;
    }
    return state;
  }

  function isValveOpen(valves: ValveState, valve: string): boolean {
    return valves[valve] > 0;
  }

  function processInput(name: string = 'input'): Input {
    const parseRegex = /Valve ([^\s]*) has flow rate=([^;]*); tunnel[s]? lead[s]? to valve[s]? (.*)/;

    let nodes: NodeMap = {}
    let startNode = 'AA';
    fs.readFileSync(`./d16.${name}.txt`).toString().split('\n').forEach((line, idx) => {
      const tokens = line.match(parseRegex);
      if (tokens == null) throw new Error("Unexpected input: " + line);
      const valve = tokens[1];
      nodes[valve] = {
        valve,
        valveIdx: idx,
        flowRate: parseInt(tokens[2], 10),
        adjacent: tokens[3].split(',').map(i => i.trim()),
      };
      if (startNode === '') { startNode = valve; }
    });

    const valves = Object.keys(nodes)
      .map(key => nodes[key].flowRate > 0 ? key : '')
      .filter(v => v !== '')
      .reduce((memo: ValveState, valve) => {
        memo[valve] = 0;
        return memo;
      }, {});

    return {
      nodes,
      valves,
      startNode,
    }
  }
})();
