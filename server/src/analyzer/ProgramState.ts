import { randomUUID } from 'crypto';
import { ASTNodeWithType, ASTRange, createDefaultRange } from '../parser/ast/ASTNode';
import { FunctionDecl } from '../parser/ast/Declarations/FunctionDecl';
import { CONTAINER_BLOCK_ID_PREFIX, DUMMY_ID, FUNCTION_NAME_MAIN, NONE_BLOCK_ID, STACK_BLOCK_ID } from '../constants';
import ErrorCollector, { ErrSeverity } from '../errors/ErrorCollector';
import { TextDocument } from 'vscode-languageserver-textdocument';
import _ from 'lodash';
import { dereferencedPointerType, extractedStructType, getActualType } from '../parser/ast/ASTTypeChecker';

export interface ProgramState {
  // mapping from id to the block with the corresponding id
  // merge state1 and state2: union the blocks from state1 and state2
  // it is assumed by now (probably provable): same block in state1 and state2 will have the same parent and contains
  blocks: Map<string, MemoryBlock>;
  // mapping from id to each pointer with the corresponding id
  // merge state1 and state2: union the pointer ids from state1 and state2, and iterate over the ids and merge canBeInvalid, pointsTo, pointedBy
  // it is assumed by now (probably provable): same pointer in state1 and state2 will have the same parent
  pointers: Map<string, MemoryPointer>;
  // mapping from struct type name to each struct definition with the corresponding id
  structDefs: Map<string, StructDef>;
  // id of the MemoryBlock container for the variables in the current scope - for ease of cleanup once getting out of scope
  memoryContainer: string;
  // mapping from function names to the function declarations
  functions: Map<string, FunctionDecl>;
  // call stack: a map of function names to their parent containers. Maps are ordered.
  callStack: Map<string, string>;
  // list of arguments (ids to existing pointers or blocks in the state) to be used by the function
  arguments: string[];
  // Signals
  signal: Signal;
  // Return values
  // returnVals?: [MemoryBlock, ...MemoryBlock[]] | [MemoryPointer, ...MemoryPointer[]] ;
  // error collector
  errorCollector: ErrorCollector;
}

// unary: pointer might be invalid (MemoryPointer.canBeInvalid)
// unary: block might not exist (MemoryBlock.existence)
// binary: pointer can point to blocks or pointers (MemoryPointer.pointsTo, MemoryBlock.pointedBy, MemoryPointer.pointedBy)
// binary: block can contain blocks or pointers (MemoryBlock.contains, MemoryBlock.parentBlock, MemoryPointer.parentBlock)

// Represent a block in memory.
export interface MemoryBlock {
  // identifier
  id: string;
  // the name when declared (struct S a; will have name a) or block_id.a for a struct field
  // or it can be randomized generated id if it is a temporary pointer with no name
  name: string;
  // type (possbily unknown if never assigned to any pointer)
  type: string | undefined;
  // range where the block is created (for more useful error message)
  range: ASTRange;
  // whether the block definitely/may exist
  existence: Status;
  // a list of pointing relations, each representing a pointer (its id) that could potentially point to the block
  pointedBy: [string, Status][];
  // a list of ids for blocks or pointers that reside in the block
  // for structs, the first item in the contains will have the same memory address as the struct block
  contains: string[];
  // the id of which block this block resides in (can be undefined for top-level blocks - including ones allocated on heap)
  parentBlock: string | undefined;
}

// Represent a pointer in memory.
export interface MemoryPointer {
  // identifier
  id: string;
  // the name when declared (so ptr for int *ptr;) or block_id.ptr for a struct field
  // or it can be randomized generated id if it is a temporary pointer with no name
  name: string;
  // type
  type: string;
  // range where the pointer is declared (for more useful error message)
  range: ASTRange;
  // whether the pointer can be invalid (NULL, dangling pointers or pointer to unknown address)
  canBeInvalid: boolean;
  // a list of pointing relations, each representing a pointer (its id) that could potentially point to this pointer
  pointedBy: [string, Status][];
  // a list of pointing relations, each representing a block or pointer (its id) that could potentially be pointed to
  // it is just the reverse MemoryBlock.pointedBy and MemoryPointer.pointedBy (doubly-linked relation), simply duplicating for faster lookup
  pointsTo: string[];
  // the id of which block this pointer resides in
  parentBlock: string | undefined;
}

// The 3-state design (excluding the DefinitelyNot case, as non-existent items will simply be removed from the state)
export enum Status {
  Definitely = 1,
  Maybe = 2
}

// Signals in order of priority
export enum Signal {
  None,
  Continue,
  Break,
  Return
}

// Type check for a memory block
export function isMemoryBlock(entity: any): entity is MemoryBlock {
  return typeof entity === 'object' && 'existence' in entity;
}

// Type check for a memory pointer
export function isMemoryPointer(entity: any): entity is MemoryPointer {
  return typeof entity === 'object' && 'canBeInvalid' in entity;
}

// Whether the value is of type MemoryBlock array
export function areMemoryBlocks(value: any): value is [MemoryBlock, ...MemoryBlock[]] {
  return Array.isArray(value) && value.length >= 1 && isMemoryBlock(value[0]);
}

// Return a MemoryBlock array - should only call this function when it is indeed a MemoryBlock array
export function getMemoryBlocks(value: any): [MemoryBlock, ...MemoryBlock[]] {
  if (areMemoryBlocks(value)) {
    return value;
  }
  return [createNewMemoryBlock({})];
}

// Whether the return value is of type MemoryPointer array
export function areMemoryPointers(value: any): value is [MemoryPointer, ...MemoryPointer[]] {
  return Array.isArray(value) && value.length >= 1 && isMemoryPointer(value[0]);
}

// Return a MemoryPointer array - should only call this function when it is indeed a MemoryPointer array
export function getMemoryPointers(value: any): [MemoryPointer, ...MemoryPointer[]] {
  if (areMemoryPointers(value)) {
    return value;
  }
  return [createNewMemoryPointer({})];
}

// get a block from the program state; if it does not exist, return a default one while logging an error
export function getMemoryBlockFromProgramState(id: string, programState: ProgramState): MemoryBlock {
  const block = programState.blocks.get(id);
  if (!block) {
    console.error('Program state does not have block with id: ' + id);
    return createNewMemoryBlock({});
  }
  return block;
}

// get a pointer from the program state; if it does not exist, return a default one while logging an error
export function getMemoryPointerFromProgramState(id: string, programState: ProgramState): MemoryPointer {
  const pointer = programState.pointers.get(id);
  if (!pointer) {
    console.error('Program state does not have pointer with id: ' + id);
    return createNewMemoryPointer({});
  }
  return pointer;
}

// get a block or pointer from the program state; if it does not exist, return a default pointer while loggin an error
export function getMemoryBlockOrPointerFromProgramState(
  id: string,
  programState: ProgramState
): MemoryBlock | MemoryPointer {
  if (programState.blocks.has(id)) {
    return getMemoryBlockFromProgramState(id, programState);
  }
  return getMemoryPointerFromProgramState(id, programState);
}

// Represent a struct definition.
// name, range, struct members
export type StructDef = [string, ASTRange, StructMemberDef[]];

// Represent a struct member declaration.

// for example, for
// struct A {
//    int a;
//    struct B b;
//    struct B *b_ptr;
// };
// the members will be like [[a, range_a, int], [b, range_b, struct B], [b_ptr, range_b_ptr, struct B *]]
export type StructMemberDef = [string, ASTRange, string];

export function createNewProgramState(textDocument: TextDocument): ProgramState {
  return {
    // Stack memory always have id = block_stack
    blocks: new Map<string, MemoryBlock>([[STACK_BLOCK_ID, createNewMemoryBlock({ id: STACK_BLOCK_ID })]]),
    pointers: new Map<string, MemoryPointer>(),
    structDefs: new Map<string, StructDef>(),
    memoryContainer: STACK_BLOCK_ID,
    functions: new Map<string, FunctionDecl>(),
    // callStack: new Set([FUNCTION_NAME_MAIN]),
    callStack: new Map([[FUNCTION_NAME_MAIN, STACK_BLOCK_ID]]),
    arguments: [],
    errorCollector: new ErrorCollector(textDocument),
    signal: Signal.None
  };
}

export function createNewMemoryBlock({
  id = randomUUID(),
  name = undefined,
  type = undefined,
  range = createDefaultRange(),
  existence = Status.Definitely,
  pointedBy = [],
  contains = [],
  parentBlock = undefined
}: {
  id?: string;
  name?: string | undefined;
  type?: string | undefined;
  range?: ASTRange;
  existence?: Status;
  pointedBy?: [string, Status][];
  contains?: string[];
  parentBlock?: string | undefined;
}): MemoryBlock {
  return {
    id,
    name: name ? name : id,
    type,
    range,
    existence,
    pointedBy,
    contains,
    parentBlock
  };
}

export function createNewMemoryPointer({
  id = randomUUID(),
  name = undefined,
  type = 'void *',
  range = createDefaultRange(),
  canBeInvalid = true,
  pointedBy = [],
  pointsTo = [],
  parentBlock
}: {
  id?: string;
  name?: string | undefined;
  type?: string;
  range?: ASTRange;
  canBeInvalid?: boolean;
  pointedBy?: [string, Status][];
  pointsTo?: string[];
  parentBlock?: string;
}): MemoryPointer {
  return {
    id: id,
    name: name ? name : id,
    type,
    range,
    canBeInvalid,
    pointedBy,
    pointsTo,
    parentBlock
  };
}

export function createNewStructDef({
  id = randomUUID(),
  range,
  members
}: {
  id?: string;
  range: ASTRange;
  members: StructMemberDef[];
}): StructDef {
  return [id, range, members];
}

// allocate memory, and return the void pointer to it
export function allocate(range: ASTRange, programState: ProgramState): MemoryPointer {
  // create a heap block
  const allocatedBlock = createNewMemoryBlock({ range });
  programState.blocks.set(allocatedBlock.id, allocatedBlock);

  // create a void pointer under the current container
  const voidPointer = createNewMemoryPointer({
    range,
    canBeInvalid: false,
    pointsTo: [allocatedBlock.id],
    parentBlock: programState.memoryContainer
  });
  programState.pointers.set(voidPointer.id, voidPointer);
  getMemoryBlockFromProgramState(programState.memoryContainer, programState).contains.push(voidPointer.id);

  // block pointed by pointer
  allocatedBlock.pointedBy.push([voidPointer.id, Status.Definitely]);

  return voidPointer;
}

// free memory entities pointed by specified pointer
export function free(pointer: MemoryPointer, programState: ProgramState) {
  // can only completely free if pointer DEFINITELY points to one entity
  if (pointer.canBeInvalid) {
    programState.errorCollector.addMemoryError(
      pointer.range,
      'You may be calling free() on an invalid pointer',
      ErrSeverity.Warning
    );
  }
  const completeFree = !pointer.canBeInvalid && pointer.pointsTo.length === 1;

  pointer.pointsTo.forEach((pointeeId) => {
    if (programState.blocks.has(pointeeId) || programState.pointers.has(pointeeId)) {
      const pointee = getMemoryBlockOrPointerFromProgramState(pointeeId, programState);
      freeEntity(pointee, programState, completeFree);
    }
  });

  pointer.canBeInvalid = true;

  if (completeFree) return; // if complete free, we are done

  // if partially free, iterate over again and remove any pointer relation between the pointer and all pointees
  pointer.pointsTo.forEach((pointeeId) => {
    if (programState.blocks.has(pointeeId) || programState.pointers.has(pointeeId)) {
      const pointee = getMemoryBlockOrPointerFromProgramState(pointeeId, programState);
      // remove pointer from pointee.pointedBy
      pointee.pointedBy.splice(
        pointee.pointedBy.findIndex(([pointerId]) => pointerId === pointer.id),
        1
      );

      // might have a leak by removing the relation - analyze
      analyzeLeak(pointee, programState);
    }
  });

  // clean up pointer.pointsTo
  pointer.pointsTo = [];
}

// free a memory block or memory pointer
// complete free - whether the free is guaranteed to remove the block
export function freeEntity(entity: MemoryBlock | MemoryPointer, programState: ProgramState, completeFree: boolean) {
  // can only free heap entities
  const ancestor = getAncestorEntityAtSameAddress(entity, programState);
  if (ancestor.parentBlock || isContainerId(ancestor.id)) {
    return;
  }

  if (completeFree) {
    // if complete free, remove the block from program state
    removeBlock(ancestor.id, programState);
  } else {
    // otherwise, propogate maybe
    propogateMaybe(ancestor, programState);
  }
}

// this function helps propogating MAYBE: when a block MAYBE exists, all its sub blocks + pointers are maybe
export function propogateMaybe(entity: MemoryBlock | MemoryPointer, programState: ProgramState) {
  if (isMemoryBlock(entity)) {
    entity.existence = Status.Maybe;
    entity.contains.forEach((childId) => {
      const child = getMemoryBlockOrPointerFromProgramState(childId, programState);
      propogateMaybe(child, programState);
    });
  } else {
    entity.canBeInvalid = true;
    entity.pointsTo.forEach((pointeeId) => {
      const pointee = getMemoryBlockOrPointerFromProgramState(pointeeId, programState);
      // for each pointee, they are now MAYBE pointed by entity (which might cause a leak, so analyze as well)
      const index = pointee.pointedBy.findIndex(
        ([pointerId, status]) => pointerId === entity.id && status === Status.Definitely
      );
      if (index !== -1) {
        pointee.pointedBy.splice(index, 1, [entity.id, Status.Maybe]);
      }
      analyzeLeak(pointee, programState);
    });
  }
}

// recursively look up the container relation and return the highest level block that shares the same address as entity
// if entity is not contained - just return entity
export function getAncestorEntityAtSameAddress(
  entity: MemoryBlock | MemoryPointer,
  programState: ProgramState
): MemoryBlock | MemoryPointer {
  if (!entity.parentBlock) return entity;

  const parentBlock = programState.blocks.get(entity.parentBlock);
  if (!parentBlock) return entity;

  let saveBlk: MemoryBlock = parentBlock;
  let currBlk: MemoryBlock | undefined = parentBlock;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const parentId = currBlk.parentBlock;
    // parent block has to exist, is not a container, and has child block as its first child to be considered
    if (!parentId) {
      return saveBlk;
    }
    currBlk = programState.blocks.get(parentId);
    if (!currBlk || isContainerId(currBlk.id) || currBlk.contains.length === 0 || currBlk.contains[0] !== saveBlk.id) {
      return saveBlk;
    }
    saveBlk = currBlk;
  }
}

// based on blockId - return whether it is a container (by checking the id prefix)
export function isContainerId(blockId: string): boolean {
  return blockId.startsWith(CONTAINER_BLOCK_ID_PREFIX);
}

// create a container block in the current program state (with the current container as the parent)
export function createContainer(programState: ProgramState, label?: string): string {
  // child to parent

  const container = createNewMemoryBlock({
    id: CONTAINER_BLOCK_ID_PREFIX + (label ? label + '_' : '') + randomUUID(),
    parentBlock: programState.memoryContainer
  });
  programState.blocks.set(container.id, container);

  // parent to child
  const parentContainer = programState.blocks.get(programState.memoryContainer);
  if (parentContainer) {
    parentContainer.contains.push(container.id);
  }

  // the memoryContainer in programState
  programState.memoryContainer = container.id;
  return container.id;
}

// clean up the current container from the program state
export function removeContainer(programState: ProgramState) {
  const parentContainer = programState.blocks.get(programState.memoryContainer)?.parentBlock;
  removeBlock(programState.memoryContainer, programState);
  programState.memoryContainer = parentContainer ? parentContainer : NONE_BLOCK_ID;
}

// remove the block (and recursively its children) and any associated pointer relation from the program state
// removeParentRelation: should be true by default to remove from parentBlock's contain and pointers's pointsTo
// but in the case of assignment (int *a = b), by setting this to true, neither should be removed
export function removeBlock(blockId: string, programState: ProgramState, removeParentRelation = true) {
  const block = programState.blocks.get(blockId);
  if (!block) return;

  // remove from program state
  programState.blocks.delete(blockId);

  // detach from parentBlock
  const parentBlockId = block.parentBlock;
  if (parentBlockId) {
    const parentBlock = programState.blocks.get(parentBlockId);
    if (parentBlock && parentBlock.contains.indexOf(blockId) !== -1) {
      parentBlock.contains.splice(parentBlock.contains.indexOf(blockId), 1);
    }
  }

  // detach from pointedBy
  for (const pointedBy of block.pointedBy) {
    const pointer = programState.pointers.get(pointedBy[0]);
    if (pointer && pointer.pointsTo.indexOf(blockId) !== -1) {
      pointer.pointsTo.splice(pointer.pointsTo.indexOf(blockId), 1);
      pointer.canBeInvalid = true;
    }
  }

  // for each of the children, recursively remove
  for (const childId of block.contains) {
    if (programState.pointers.has(childId)) {
      removePointer(childId, programState);
    } else {
      removeBlock(childId, programState);
    }
  }
}

// remove the pointer and any associated pointer relation from the program state
// removeParentRelation: should be true by default to remove from parentBlock's contain and pointers's pointsTo
// but in the case of assignment (int *a = b), by setting this to true, neither should be removed
export function removePointer(pointerId: string, programState: ProgramState, removeParentRelation = true) {
  const pointer = programState.pointers.get(pointerId);
  if (!pointer) return;

  // remove from program state
  programState.pointers.delete(pointerId);

  // this code block will only run if removeParentRelation is true
  // when it is false, it is regarding an assignment, in which these relations should be kept
  if (removeParentRelation) {
    // detach from parentBlock
    const parentBlockId = pointer.parentBlock;
    if (parentBlockId) {
      const parentBlock = programState.blocks.get(parentBlockId);
      if (parentBlock && parentBlock.contains.indexOf(pointerId) !== -1) {
        parentBlock.contains.splice(parentBlock.contains.indexOf(pointerId), 1);
      }
    }

    // detach from pointedBy
    for (const pointedBy of pointer.pointedBy) {
      const pointer = programState.pointers.get(pointedBy[0]);
      if (pointer && pointer.pointsTo.indexOf(pointerId) !== -1) {
        pointer.pointsTo.splice(pointer.pointsTo.indexOf(pointerId), 1);
        pointer.canBeInvalid = true;
      }
    }
  }

  // update each pointee - potentially report memory leak and remove as well
  for (const pointeeId of pointer.pointsTo) {
    let pointee: MemoryBlock | MemoryPointer | undefined;
    pointee = programState.blocks.get(pointeeId);
    if (!pointee) {
      pointee = programState.pointers.get(pointeeId);
      if (!pointee) continue;
    }
    const index = pointee.pointedBy.findIndex((ele) => ele[0] === pointerId);
    if (index !== -1) {
      pointee.pointedBy.splice(index, 1);
    }
    analyzeLeak(pointee, programState);
  }
}

export function analyzeLeak(entity: MemoryBlock | MemoryPointer, programState: ProgramState) {
  const leak = getLeak(entity);
  console.log('There is a memory leak here');
  if (leak) {
    // report error
    if (leak === Status.Definitely) {
      programState.errorCollector.addMemoryError(entity.range, 'There is definitely a memory leak here', ErrSeverity.Error);
    } else {
      programState.errorCollector.addMemoryError(entity.range, 'There is possibly a memory leak here', ErrSeverity.Warning);
    }
    if (programState.pointers.has(entity.id)) {
      removePointer(entity.id, programState);
    } else {
      removeBlock(entity.id, programState);
    }
  }
}

// check whether there is a memory leak with the specified entity
export function getLeak(entity: MemoryBlock | MemoryPointer): Status | undefined {
  // has to be a top level block (except the stack) to be leakable
  if (entity.parentBlock !== undefined || entity.id === STACK_BLOCK_ID) return;
  if (entity.pointedBy.length === 0) {
    // if there are no pointers to the entity
    // if the block might not exist - MAYBE leaked
    if (isMemoryBlock(entity) && entity.existence === Status.Maybe) return Status.Maybe;
    // otherwise, DEFINITELY leaked
    return Status.Definitely;
  } else if (entity.pointedBy.findIndex(([, status]) => status === Status.Definitely) === -1) {
    // if there are no pointer DEFINITELY pointing to the entity - MAYBE leaked
    return Status.Maybe;
  }
}

// Merge multiple (at least 1) program states into 1 - for control flow
// We expect all states to be cleaned (the program state does not contain anything out of scope)
// The target state will directly be modified and will also be returned
export function mergeProgramStates(targetState: ProgramState, states: [ProgramState, ...ProgramState[]]): ProgramState {
  console.log('Merging program state');
  const resBlocks: Map<string, MemoryBlock> = new Map();
  const resPointers: Map<string, MemoryPointer> = new Map();
  let resSignal = Signal.None;
  // For each of the states resulted from control flow
  for (const tmpState of states) {
    // Merge memory blocks
    tmpState.blocks.forEach((b, k) => {
      // Check if block exists in every state, if it doesn't, then the block is automatically a maybe exist
      let inEveryState = true;
      for (const state1 of states) {
        inEveryState &&= state1.blocks.has(k);
      }
      if (!inEveryState) {
        // Block does not exist in every state so the block maybe exists after merge
        b.existence = Status.Maybe;
        resBlocks.set(k, b);
      } else {
        // Either block is in every state or there is only 1 state
        const oldBlock = resBlocks.get(k);
        if (oldBlock) {
          resBlocks.set(k, {
            ...oldBlock,
            existence: b.existence === Status.Maybe ? Status.Maybe : oldBlock.existence
          });
        } else {
          // there is only 1 state provided
          resBlocks.set(k, b);
        }
      }
    });
    // Merge memory pointers
    tmpState.pointers.forEach((p, k) => {
      const oldPointer = resPointers.get(k);
      if (oldPointer) {
        const pointedByMap: Map<string, Status> = new Map();
        for (const pointedBy of [...oldPointer.pointedBy, ...p.pointedBy]) {
          if (pointedByMap.has(pointedBy[0]) && pointedBy[1] === Status.Maybe) {
            pointedByMap.set(pointedBy[0], Status.Maybe);
          }
        }

        const newPointer = {
          ...oldPointer,
          canBeInvalid: oldPointer.canBeInvalid || p.canBeInvalid,
          pointedBy: Array.from(pointedByMap, ([id, status]) => [id, status]),
          pointsTo: Array.from(new Set([...oldPointer.pointsTo, ...p.pointsTo]))
        } as MemoryPointer;
        resPointers.set(k, newPointer);
        propogateMaybe(newPointer, targetState); // TODO Check if this is correct
      } else {
        resPointers.set(k, p);
      }

      // Merge signals
      if (tmpState.signal > resSignal) {
        // We do a pessimistic merge of signals here, where return signals have the highest priority,
        // followed by break, continue, and no signal.
        // For example, if one branch returns and the other doesn't, then we treat the two branches as returns.
        resSignal = tmpState.signal;
      }
    });
  }

  targetState.blocks = resBlocks;
  targetState.pointers = resPointers;
  targetState.signal = resSignal;
  return targetState;
}

// merge multiple (at least 1) memory blocks into 1 - for variable declaration + initialization
// for example, struct S *ptr0 = *ptr1; where ptr1 can point to multiple structs.
// this function assumes the blocks have identical contain structures recursively - should be the case if program is well typed
export function mergeBlocks(
  blocks: [MemoryBlock, ...MemoryBlock[]],
  programState: ProgramState,
  otherProperties: any
): MemoryBlock {
  const existence = blocks.reduce(
    (existence, block) => (block.existence === Status.Maybe ? Status.Maybe : existence),
    Status.Definitely
  );
  const blockId = 'id' in otherProperties ? otherProperties['id'] : randomUUID();

  const mergedBlock = createNewMemoryBlock({
    ...otherProperties,
    id: blockId,
    existence,
    pointedBy: [],
    contains: []
  });

  programState.blocks.set(blockId, mergedBlock);
  if (otherProperties.parentBlock) {
    getMemoryBlockFromProgramState(otherProperties.parentBlock, programState).contains.push(blockId);
  }
  
  // for each sub-block or pointer, merge them as well
  for (let i = 0; i < blocks[0].contains.length; i++) {
    // firstEntity is either a block or pointer
    const firstEntity = programState.blocks.has(blocks[0].contains[i])
      ? getMemoryBlockFromProgramState(blocks[0].contains[i], programState)
      : getMemoryPointerFromProgramState(blocks[0].contains[i], programState);
    if (isMemoryBlock(firstEntity)) {
      // firstEntity is a memory block - so all blocks will have the child at this index as a memory block
      const subBlocks: [MemoryBlock, ...MemoryBlock[]] = [firstEntity];
      blocks.slice(1).forEach((block) => {
        subBlocks.push(getMemoryBlockFromProgramState(block.contains[i], programState));
      });
      mergedBlock.contains.push(
        mergeBlocks(subBlocks, programState, {
          name: firstEntity.name,
          type: firstEntity.type,
          range: firstEntity.range,
          parentBlock: blockId
        }).id
      );
    } else {
      // firstEntity is a memory pointer - so all blocks will have the child at this index as a memory pointer
      const subPointers: [MemoryPointer, ...MemoryPointer[]] = [firstEntity];
      blocks.slice(1).forEach((block) => {
        subPointers.push(getMemoryPointerFromProgramState(block.contains[i], programState));
      });
      mergedBlock.contains.push(
        mergePointers(subPointers, programState, {
          name: firstEntity.name,
          type: firstEntity.type,
          range: firstEntity.range,
          parentBlock: blockId
        }).id
      );
    }
  }

  // If existence is maybe, it should propogate through the children recursively and change pointers canBeInvalid be true
  if (existence === Status.Maybe) {
    propogateMaybe(mergedBlock, programState);
  }
  return mergedBlock;
}

// merge multiple (at least 1) memory pointers into 1 - for variable declaration + initialization
// for example, struct S **ptr0 = *ptr1; where ptr1 can point to multiple pointers.
export function mergePointers(
  pointers: [MemoryPointer, ...MemoryPointer[]],
  programState: ProgramState,
  otherProperties: any
): MemoryPointer {
  const pointerId = 'id' in otherProperties ? otherProperties['id'] : randomUUID();

  let canBeInvalid = false;

  // pointer.pointsTo
  const pointsTo: Set<string> = new Set();
  pointers.forEach((pointer) => {
    canBeInvalid ||= pointer.canBeInvalid;
    pointer.pointsTo.forEach((pointee) => {
      pointsTo.add(pointee);
    });
  });

  // pointee.pointedBy
  const pointerRelationStatus = !canBeInvalid && pointsTo.size === 1 ? Status.Definitely : Status.Maybe;
  pointsTo.forEach((pointee) => {
    getMemoryBlockOrPointerFromProgramState(pointee, programState).pointedBy.push([pointerId, pointerRelationStatus]);
  });

  const mergedPointer = createNewMemoryPointer({
    ...otherProperties,
    id: pointerId,
    canBeInvalid,
    pointedBy: [],
    pointsTo: [...pointsTo]
  });

  programState.pointers.set(mergedPointer.id, mergedPointer);
  if (otherProperties.parentBlock) {
    getMemoryBlockFromProgramState(otherProperties.parentBlock, programState).contains.push(mergedPointer.id);
  }

  return mergedPointer;
}

// Creates a deep clone of the program state but still use the original errorCollector
export function cloneProgramState(programState: ProgramState) {
  const newProgramState = _.cloneDeep(programState);
  newProgramState.errorCollector = programState.errorCollector;
  return newProgramState;
}

// copy pointedBy from source to target entity
export function assignPointedBy(
  target: MemoryBlock | MemoryPointer,
  source: MemoryBlock | MemoryPointer,
  programState: ProgramState
) {
  target.pointedBy = [...source.pointedBy];
  target.pointedBy.forEach(([pointerId]) => {
    const pointer = getMemoryPointerFromProgramState(pointerId, programState);
    pointer.pointsTo.push(target.id);
  });
}

// assign merged block to the target block
export function assignMergedBlock(
  targetBlock: MemoryBlock,
  blocks: [MemoryBlock, ...MemoryBlock[]],
  programState: ProgramState
) {
  // create a merged block first (to prevent reporting memory leaks by removing first)
  const mergedBlock = mergeBlocks(blocks, programState, {
    name: targetBlock.name,
    type: targetBlock.type,
    range: targetBlock.range
  });

  // parent block - not doing this in mergePointers to prevent container to be updated
  mergedBlock.parentBlock = targetBlock.parentBlock;

  // pointedBy
  assignPointedBy(mergedBlock, targetBlock, programState);

  // remove the variable block from the state
  // but don't remove its container or pointer to itself relation - as those will be kept during an assignment
  removeBlock(targetBlock.id, programState, false);

  // id changing
  programState.blocks.delete(mergedBlock.id);
  mergedBlock.id = targetBlock.id;
  programState.blocks.set(mergedBlock.id, mergedBlock);

  // children needs new parent id
  mergedBlock.contains.forEach((childId) => {
    getMemoryBlockOrPointerFromProgramState(childId, programState).parentBlock = mergedBlock.id;
  });
}

// assign merged pointer to the target pointer
export function assignMergedPointer(
  targetPointer: MemoryPointer,
  pointers: [MemoryPointer, ...MemoryPointer[]],
  programState: ProgramState
) {
  // create a merged pointer first (to prevent reporting memory leaks by removing first)
  const mergedPointer = mergePointers(pointers, programState, {
    name: targetPointer.name,
    type: targetPointer.type,
    range: targetPointer.range
  });

  // parent block - not doing this in mergePointers to prevent container to be updated
  mergedPointer.parentBlock = targetPointer.parentBlock;

  // pointedBy
  mergedPointer.pointedBy = [...targetPointer.pointedBy];

  // remove the variable pointer from the state
  // but don't remove its container or pointer to itself relation - as those will be kept during an assignment
  removePointer(targetPointer.id, programState, false);

  // id changing
  const oldId = mergedPointer.id;
  programState.pointers.delete(oldId);
  mergedPointer.id = targetPointer.id;
  programState.pointers.set(mergedPointer.id, mergedPointer);

  // pointees needs new pointedBy id
  mergedPointer.pointsTo.forEach((pointeeId) => {
    const pointee = getMemoryBlockOrPointerFromProgramState(pointeeId, programState);
    const index = pointee.pointedBy.findIndex(([pointerId, _]) => pointerId === oldId);
    if (index !== -1) {
      pointee.pointedBy[index] = [mergedPointer.id, pointee.pointedBy[index][1]];
    }
  });
}

// a function that clears all pointing relation between the pointer and all its pointees
export function invalidatePointer(pointer: MemoryPointer, programState: ProgramState) {
  pointer.canBeInvalid = true;

  // clear out pointee.pointedBy
  pointer.pointsTo.forEach((pointeeId) => {
    const entity = getMemoryBlockOrPointerFromProgramState(pointeeId, programState);
    entity.pointedBy.splice(
      entity.pointedBy.findIndex(([pointerId, _]) => pointerId === pointer.id),
      1
    );
  });

  // clear out pointer.pointsTo
  pointer.pointsTo = [];

  // the only possible way to cause memory leak: this pointer serves as the only pointer DEFINITELY pointing to a block
  // so clearing it will cause a memory leak (whether DEFINITELY or MAYBE)
  if (pointer.pointsTo.length === 1 && programState.blocks.has(pointer.pointsTo[0])) {
    analyzeLeak(getMemoryBlockFromProgramState(pointer.pointsTo[0], programState), programState);
  }
}

// produce dummy output for some cases of expressions (expressions should return some list of blocks or pointers)
export function produceExprDummyOutput(
  n: ASTNodeWithType,
  programState: ProgramState,
  properties: any
): [MemoryBlock, ...MemoryBlock[]] | [MemoryPointer, ...MemoryPointer[]] {
  if (dereferencedPointerType(getActualType(n.type))) {
    const pointer = createNewMemoryPointer({
      ...properties,
      id: DUMMY_ID + randomUUID(),
      range: n.range,
      type: getActualType(n.type),
      parentBlock: programState.memoryContainer
    });
    programState.pointers.set(pointer.id, pointer);
    getMemoryBlockFromProgramState(programState.memoryContainer, programState).contains.push(pointer.id);
    return [pointer];
  } else {
    const block = createNewMemoryBlock({
      ...properties,
      id: DUMMY_ID + randomUUID(),
      range: n.range,
      type: getActualType(n.type),
      parentBlock: programState.memoryContainer
    });
    programState.blocks.set(block.id, block);
    getMemoryBlockFromProgramState(programState.memoryContainer, programState).contains.push(block.id);
    return [block];
  }
}

// populate the block based on specified struct type
export function populateStructBlock(block: MemoryBlock, type: string, programState: ProgramState) {
  // has to be an empty block
  if (block.contains.length !== 0) return;

  // extract struct type
  const structName = extractedStructType(type);
  if (!structName) return;

  // obtain and apply the struct definition
  const structDef = programState.structDefs.get(structName);
  if (!structDef) return;

  const [_, __, members] = structDef;

  members.forEach(([memberName, _, memberType]) => {
    const memberStructName = extractedStructType(memberType);
    // if it is a struct, create a block and recursively populate
    if (memberStructName) {
      const subStruct = createNewMemoryBlock({
        name: memberName,
        type: memberType,
        range: block.range,
        existence: block.existence,
        pointedBy: [],
        contains: [],
        parentBlock: block.id
      });
      programState.blocks.set(subStruct.id, subStruct);
      block.contains.push(subStruct.id);

      populateStructBlock(subStruct, memberType, programState);
    } else {
      // in other cases, just create a pointer or block based on type
      if (dereferencedPointerType(memberType)) {
        const subPointer = createNewMemoryPointer({
          name: memberName,
          type: memberType,
          range: block.range,
          canBeInvalid: true,
          pointedBy: [],
          pointsTo: [],
          parentBlock: block.id
        });
        programState.pointers.set(subPointer.id, subPointer);
        block.contains.push(subPointer.id);
      } else {
        const subBlock = createNewMemoryBlock({
          name: memberName,
          type: memberType,
          range: block.range,
          existence: block.existence,
          pointedBy: [],
          contains: [],
          parentBlock: block.id
        });
        programState.blocks.set(subBlock.id, subBlock);
        block.contains.push(subBlock.id);
      }
    }
  });
}
