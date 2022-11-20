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
	contains: [string];
	// the id of which block this block resides in (can be undefined for top-level block)
	in: string | undefined;
}

// Represent a pointer in memory.
export interface MemoryPointer {
	// identifier
	id: string;
	// whether the pointer can be invalid (NULL, dangling pointers or pointer to unknown address)
	canBeInvalid: boolean;
	// a list of pointing relations, each representing a pointer (its id) that could potentially point to this pointer
	pointedBy: [string, Status][];
	// a list of pointing relations, each representing a a block or pointer (its id) that could potentially be pointed to
	// it is just the reverse MemoryBlock.pointedBy and MemoryPointer.pointedBy (doubly-linked relation), simply duplicating for faster lookup
	pointsTo: [string, Status][];
	// the id of which block this pointer resides in
	in: string;
}

// The 3-state design (excluding the DefinitelyNot case, as non-existent items will simply be removed from the state)
export enum Status {
	Definitely,
	Maybe
}

