import { LargeNumberLike, randomUUID } from 'crypto';
import { ASTRange, createDefaultRange } from '../ast/ASTNode';
import { FunctionDecl } from '../ast/Declarations/FunctionDecl';
import { STACK_BLOCK_ID } from '../constants';
import ErrorCollector from './ErrorCollector';
import { dumpProgramState } from './ProgramStateDumper';

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
  parentBlock: string;
}

// The 3-state design (excluding the DefinitelyNot case, as non-existent items will simply be removed from the state)
export enum Status {
  Definitely = 1,
  Maybe = 2
}

// Type check for a memory block
export function isMemoryBlock(entity: any): entity is MemoryBlock {
  return typeof entity === 'object' && 'existence' in entity;
}

// Type check for a memory pointer
export function isMemoryPointer(entity: any): entity is MemoryPointer {
  return typeof entity === 'object' && 'canBeInvalid' in entity;
}

// Represent a struct definition. (it is a stack here, because of the potential of struct redefinition)
// top of stack will be referenced (but previously declared items with the old definition can still work by id matching against the stack)
// in the form of a [id, range, struct members] tuple
export type StructDef = [string, ASTRange, StructMemberDef[]][];

// Represent a struct member declaration.

// for example, for
// struct A {
//    int a;
//    struct B b;
//    struct B *b_ptr;
// };
// the members will be like [['a', range_a, undefined], [b, range_b, 'some_id_for_struct_B'], ['b_ptr', range_b_ptr, undefined]]
export type StructMemberDef = [string, ASTRange, string | undefined];

export function createNewProgramState(): ProgramState {
  return {
    // Stack memory always have id = block_stack
    blocks: new Map<string, MemoryBlock>([[STACK_BLOCK_ID, createNewMemoryBlock({ id: STACK_BLOCK_ID })]]),
    pointers: new Map<string, MemoryPointer>(),
    structDefs: new Map<string, StructDef>(),
    memoryContainer: STACK_BLOCK_ID,
    functions: new Map<string, FunctionDecl>(),
    errorCollector: new ErrorCollector()
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
  parentBlock = STACK_BLOCK_ID
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
  return [[id, range, members]];
}

export function addStructDef({
  structDefs,
  name,
  id = randomUUID(),
  range,
  members
}: {
  structDefs: Map<string, StructDef>;
  name: string;
  id?: string;
  range: ASTRange;
  members: StructMemberDef[];
}) {
  const structDef = structDefs.get(name);
  if (structDef) {
    structDef.unshift([id, range, members]);
  } else {
    structDefs.set(name, createNewStructDef({ id, range, members }));
  }
}

export function pointerPointsTo(pointer: MemoryPointer, pointee: MemoryBlock | MemoryPointer, status: Status) {
  pointer.pointsTo.push(pointee.id);
  pointee.pointedBy.push([pointer.id, status]);
}

export function resetPointerPointsTo(ptr: MemoryPointer, programState: ProgramState) {
  ptr.pointsTo.forEach(([id, _]) => {
    const ptr1 = programState.pointers.get(id);
    const blk1 = programState.blocks.get(id);
    if (ptr1) {
      ptr1.pointedBy = ptr1.pointedBy.filter(([ptr2Id, _]) => ptr2Id !== ptr.id);
      // TODO can analyze dangling pointers here
    } else if (blk1) {
      blk1.pointedBy = blk1.pointedBy.filter(([blkId, _]) => blkId !== ptr.id);
      // TODO can analyze memory leaks here
    } else {
      throw new Error(`Pointer ${ptr} points to an invalid id ${id}`);
    }
  });
}

// free a memory block (remove all its connections in the program state)
// TODO: currently assume no maybe state - fix when having control flow
export function freeMemoryBlock(blk: MemoryBlock, programState: ProgramState) {
  // can only free heap blocks with no parent (or other blocks that have the same address as them)
  const ancestor = getAncestorBlockAtSameAddress(blk, programState);
  if (ancestor.parentBlock || ancestor.id === STACK_BLOCK_ID) {
    return;
  }
  // TODO: recursively traverse through blocks and pointers contained in ancestor and "free" them
}

// check whether the specified block id is an ancestor of blk
export function isAncestor(blk: MemoryBlock, ancestorId: string, programState: ProgramState): boolean {
  let currBlk: MemoryBlock | undefined = blk;
  while (currBlk.parentBlock) {
    currBlk = programState.blocks.get(currBlk.parentBlock);
    if (!currBlk) return false;
    if (currBlk.id === ancestorId) return true;
  }
  return false;
}

// recursively look up the container relation and return the highest level block that shares the same address as blk
export function getAncestorBlockAtSameAddress(blk: MemoryBlock, programState: ProgramState): MemoryBlock {
  let saveBlk: MemoryBlock = blk;
  let currBlk: MemoryBlock | undefined = saveBlk;
  while (true) {
    const parentId = currBlk.parentBlock;
    // parent block has to exist, is not the stack block, and has child block as its first child to be considered
    if (!parentId) {
      return saveBlk;
    }
    currBlk = programState.blocks.get(parentId);
    if (!currBlk || currBlk.id === STACK_BLOCK_ID || currBlk.contains.length === 0 || currBlk.contains[0] !== saveBlk.id) {
      return saveBlk;
    }
    saveBlk = currBlk;
  }
}

// check whether a block is in heap, by recursively looking at its parent
export function blockIsInHeap(blk: MemoryBlock, programState: ProgramState) {
  let currBlk: MemoryBlock | undefined = blk;
  while (currBlk && currBlk.id !== STACK_BLOCK_ID) {
    const parentId = currBlk.parentBlock;
    // parent is undefined - this is definitely on the heap
    if (!parentId) {
      return true;
    }
    currBlk = programState.blocks.get(parentId);
  }
  // if parent block is undefined - this is definitely on the heap
  // otherwise the loop terminates because the parent block is stack
  return !currBlk;
}

// create a container block in the current program state (with the current container as the parent)
export function createContainer(programState: ProgramState): string {
  // child to parent
  const container = createNewMemoryBlock({
    parentBlock: programState.memoryContainer
  });
  programState.blocks.set(container.id, container);

  // parent to child
  const parentContainer = programState.blocks.get(programState.memoryContainer);
  if (parentContainer) {
    parentContainer.contains.push(container.id);
  }
  return container.id;
}

// remove the block (and recursively its children) and any associated pointer relation from the program state
export function removeBlock(blockId: string, programState: ProgramState) {
  const block = programState.blocks.get(blockId);
  if (!block) return;

  // remove from program state
  programState.blocks.delete(blockId);

  // detach from parentBlock
  const parentBlockId = block.parentBlock;
  if (parentBlockId) {
    const parentBlock = programState.blocks.get(parentBlockId);
    if (parentBlock && parentBlock.contains.indexOf(blockId) !== -1) {
      parentBlock.contains.splice(parentBlock.contains.indexOf(blockId));
    }
  }

  // detach from pointedBy
  for (const pointedBy of block.pointedBy) {
    const pointer = programState.pointers.get(pointedBy[0]);
    if (pointer && pointer.pointsTo.indexOf(blockId) !== -1) {
      pointer.pointsTo.splice(pointer.pointsTo.indexOf(blockId));
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
export function removePointer(pointerId: string, programState: ProgramState) {
  const pointer = programState.pointers.get(pointerId);
  if (!pointer) return;

  // remove from program state
  programState.pointers.delete(pointerId);

  // detach from parentBlock
  const parentBlockId = pointer.parentBlock;
  const parentBlock = programState.blocks.get(parentBlockId);
  if (parentBlock && parentBlock.contains.indexOf(pointerId) !== -1) {
    parentBlock.contains.splice(parentBlock.contains.indexOf(pointerId));
  }

  // detach from pointedBy
  for (const pointedBy of pointer.pointedBy) {
    const pointer = programState.pointers.get(pointedBy[0]);
    if (pointer && pointer.pointsTo.indexOf(pointerId) !== -1) {
      pointer.pointsTo.splice(pointer.pointsTo.indexOf(pointerId));
      pointer.canBeInvalid = true;
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
      pointee.pointedBy.splice(index);
    }
    const leak = getLeak(pointee);
    if (leak) {
      // TODO: report error
      if (programState.pointers.has(pointeeId)) {
        removePointer(pointeeId, programState);
      } else {
        removeBlock(pointeeId, programState);
      }
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
  } else if (entity.pointedBy.findIndex((ele) => ele[1] === Status.Definitely) === -1) {
    // if there are no pointer DEFINITELY pointing to the entity - MAYBE leaked
    return Status.Maybe;
  }
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

// Merge multiple (at least 1) program states into 1 - for control flow
// We expect all states to be cleaned (the program state does not contain anything out of scope)
// The target state will directly be modified and will also be returned
export function mergeProgramStates(targetState: ProgramState, states: [ProgramState, ...ProgramState[]]): ProgramState {
  const resBlocks: Map<string, MemoryBlock> = new Map();
  const resPointers: Map<string, MemoryPointer> = new Map();
  // For each of the states resulted from control flow
  for (const tmpState of states) {
    // Merge memory blocks
    tmpState.blocks.forEach((b, k) => {
      const oldBlock = resBlocks.get(k);
      if (oldBlock) {
        console.log(
          `Merge program state saw duplicated blocks, resBlocks ${resBlocks}\ntmpState ${dumpProgramState(tmpState)}`
        );
        resBlocks.set(k, {
          ...oldBlock,
          existence: b.existence === Status.Maybe ? Status.Maybe : oldBlock.existence
        });
      } else {
        resBlocks.set(k, b);
      }
    });
    // Merge memory pointers
    tmpState.pointers.forEach((p, k) => {
      const oldPointer = resPointers.get(k);
      if (oldPointer) {
        console.log(
          `Merge program state saw duplicated pointers, resPointers ${resPointers}\ntmpState ${dumpProgramState(tmpState)}`
        );
        const pointedByMap: Map<string, Status> = new Map();
        for (const pointedBy of [...oldPointer.pointedBy, ...p.pointedBy]) {
          if (pointedByMap.has(pointedBy[0]) && pointedBy[1] === Status.Maybe) {
            pointedByMap.set(pointedBy[0], Status.Maybe);
          }
        }
        // FIXME propagate existence of pointers
        resPointers.set(k, {
          ...oldPointer,
          canBeInvalid: oldPointer.canBeInvalid || p.canBeInvalid,
          pointedBy: Array.from(pointedByMap, ([id, status]) => [id, status]),
          pointsTo: Array.from(new Set([...oldPointer.pointsTo, ...p.pointsTo]))
        });
      } else {
        resPointers.set(k, p);
      }
    });
  }

  targetState.blocks = resBlocks;
  targetState.pointers = resPointers;
  return targetState;
}

// merge multiple (at least 1) memory blocks into 1 - for assignment
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

  const contains = [];
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
      contains.push(
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
      contains.push(
        mergePointers(subPointers, programState, {
          name: firstEntity.name,
          type: firstEntity.type,
          range: firstEntity.range,
          parentBlock: blockId
        }).id
      );
    }
  }

  const mergedBlock = createNewMemoryBlock({
    ...otherProperties,
    id: blockId,
    existence,
    pointedBy: [],
    contains
  });

  programState.blocks.set(blockId, mergedBlock);
  return mergedBlock;
}

// merge multiple (at least 1) memory pointers into 1 - for assignment
// for example, struct S **ptr0 = *ptr1; where ptr1 can point to multiple pointers.
export function mergePointers(
  pointers: [MemoryPointer, ...MemoryPointer[]],
  programState: ProgramState,
  otherProperties: any
): MemoryPointer {
  let canBeInvalid = false;
  const pointsTo: Set<string> = new Set();
  pointers.forEach((pointer) => {
    canBeInvalid ||= pointer.canBeInvalid;
    pointer.pointsTo.forEach((pointee) => {
      pointsTo.add(pointee);
    });
  });

  const mergedPointer = createNewMemoryPointer({
    ...otherProperties,
    canBeInvalid,
    pointedBy: [],
    pointsTo: [...pointsTo]
  });

  programState.pointers.set(mergedPointer.id, mergedPointer);
  return mergedPointer;
}

// Creates a deep clone of the program state but still use the original errorCollector
export function cloneProgramState(programState: ProgramState) {
  const newProgramState = structuredClone(programState);
  newProgramState.errorCollector = programState.errorCollector;
  return newProgramState;
}
