import { cloneProgramState, ProgramState } from './ProgramState';

// dumping the program state as a JSON
// replacer concept reference: https://stackoverflow.com/questions/29085197/how-do-you-json-stringify-an-es6-map
function replacer(key: any, value: any) {
  if (value instanceof Map) {
    return Object.fromEntries(value);
  } else {
    return value;
  }
}

export function dumpProgramState(programState: ProgramState) {
  console.log('BLOCKS');
  console.log(JSON.stringify(programState.blocks, replacer, 2));

  console.log('POINTERS');
  console.log(JSON.stringify(programState.pointers, replacer, 2));
}
