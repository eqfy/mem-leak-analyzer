import { randomUUID } from 'crypto';
import { ASTRange, createDefaultRange } from '../ast/ASTNode';

export interface ProgramState {
  // mapping from id to the block with the corresponding id
  blocks: Map<string, MemoryBlock>;
  // mapping from id to each pointer with the corresponding id
  pointers: Map<string, MemoryPointer>;
}

// unary: pointer might be invalid (MemoryPointer.canBeInvalid)
// unary: block might not exist (MemoryBlock.existence)
// binary: pointer can point to blocks or pointers (MemoryPointer.pointsTo, MemoryBlock.pointedBy, MemoryPointer.pointedBy)
// binary: block can contain blocks or pointers (MemoryBlock.contains, MemoryBlock.parentBlock, MemoryPointer.parentBlock)

// Represent a block in memory.
export interface MemoryBlock {
  // identifier
  id: string;
  // range where the block is created (for more useful error message)
  range: ASTRange;
  // whether the block definitely/may exist
  existence: Status;
  // a list of pointing relations, each representing a pointer (its id) that could potentially point to the block
  pointedBy: [string, Status][];
  // a list of ids for blocks or pointers that reside in the block
  contains: string[];
  // the id of which block this block resides in (can be undefined for top-level block)
  parentBlock: string | undefined;
}

// Represent a pointer in memory.
export interface MemoryPointer {
  // identifier
  id: string;
  // name when the pointer is declared (so ptr for int *ptr;) or block_id.ptr for a struct field
  name: string;
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
  Definitely,
  Maybe
}

export function createNewProgramState(): ProgramState {
  return {
    // Main memory always have id = '1'
    blocks: new Map<string, MemoryBlock>([['1', createNewMemoryBlock({ id: '1' })]]),
    pointers: new Map<string, MemoryPointer>()
  };
}

export function createNewMemoryBlock({
  id = randomUUID(),
  range = createDefaultRange(),
  existence = Status.Definitely,
  pointedBy = [],
  contains = [],
  parentBlock = undefined
}): MemoryBlock {
  return {
    id,
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
  range = createDefaultRange(),
  canBeInvalid = false,
  pointedBy = [],
  pointsTo = [],
  parentBlock = undefined
}): MemoryPointer {
  return {
    id,
    name: name ? name : id,
    range,
    canBeInvalid,
    pointedBy,
    pointsTo,
    parentBlock: parentBlock === undefined ? '1' : parentBlock
  };
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

export function freeMemoryBlock(blk: MemoryBlock, programState: ProgramState) {
  // TODO
}
