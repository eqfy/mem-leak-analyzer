import {randomUUID} from "crypto";

export interface ProgramState {
	// mapping from id to the block with the corresponding id
	blocks: Map<string, MemoryBlock>;
	// mapping from id to each pointer with the corresponding id
	pointers: Map<string, MemoryPointer>;
}

// Represent a block in memory.
export interface MemoryBlock {
	// identifier
	id: string;
	// whether the block definitely/may exist
	existence: Status;
	// a list of pointing relations, each representing a pointer (its id) that could potentially point to the block
	pointedBy: [string, Status][];
	// a list of ids for blocks or pointers that reside in the block
	contains: [string][];
	// the id of which block this block resides in (can be undefined for top-level block)
	parentBlock: string | undefined;
}

// Represent a pointer in memory.
export interface MemoryPointer {
	// identifier
	id: string;
	// whether the pointer can be invalid (NULL, dangling pointers or pointer to unknown address)
	canBeInvalid: boolean;
	// a list of pointing relations, each representing a pointer (its id) that could potentially point to this pointer
	pointedBy: [string, Status][];
	// a list of pointing relations, each representing a block or pointer (its id) that could potentially be pointed to
	// it is just the reverse MemoryBlock.pointedBy and MemoryPointer.pointedBy (doubly-linked relation), simply duplicating for faster lookup
	pointsTo: [string, Status][];
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
		// Main memory always have id = "1"
		blocks: new Map<string, MemoryBlock>([["1", createNewMemoryBlock("1")]]),
		pointers: new Map<string, MemoryPointer>(),
	}
}

export function createNewMemoryBlock(id=randomUUID(), existence=Status.Definitely, pointedBy=[], contains=[], parentBlock=undefined): MemoryBlock {
	return {
		id,
		existence,
		pointedBy,
		contains,
		parentBlock: undefined,
	}
}

export function createNewMemoryPointer(id=randomUUID(), canBeInvalid=false, pointedBy=[], pointsTo=[], parentBlock: string): MemoryPointer {
	return {
		id,
		canBeInvalid,
		pointedBy,
		pointsTo,
		parentBlock,
	}
}

export function addPtrToBlock(ptr: MemoryPointer, blk: MemoryBlock, status: Status) {
	ptr.pointsTo.push([blk.id, status])
	blk.pointedBy.push([ptr.id, status])
}

export function addPtr1ToPtr2(ptr1: MemoryPointer, ptr2: MemoryPointer, status: Status) {
	ptr1.pointsTo.push([ptr2.id, status])
	ptr2.pointedBy.push([ptr1.id, status])
}

export function resetPointerPointsTo(ptr: MemoryPointer, programState: ProgramState) {
	ptr.pointsTo.forEach(([id, _]) => {
		const ptr1 = programState.pointers.get(id)
		const blk1 = programState.blocks.get(id)
		if (ptr1) {
			ptr1.pointedBy = ptr1.pointedBy.filter(([ptr2Id, _]) => ptr2Id !== ptr.id)
			// TODO can analyze dangling pointers here
		} else if (blk1) {
			blk1.pointedBy = blk1.pointedBy.filter(([blkId, _]) => blkId !== ptr.id)
			// TODO can analyze memory leaks here
		} else {
			throw new Error(`Pointer ${ptr} points to an invalid id ${id}`)
		}
	})
}

export function freeMemoryBlock(blk: MemoryBlock, programState: ProgramState) {
	// TODO
}


