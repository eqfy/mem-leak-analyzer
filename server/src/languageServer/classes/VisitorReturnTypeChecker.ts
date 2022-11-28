import { createDefaultRange } from '../ast/ASTNode';
import { AnalyzerVisitorReturnType } from './AnalyzerVisitor';
import { createNewMemoryBlock, createNewMemoryPointer, isMemoryBlock, isMemoryPointer, MemoryBlock, MemoryPointer, StructMemberDef } from './ProgramState';

// Whether the return value is of type StructMemberDef
export function isStructMemberDef(returnValue: AnalyzerVisitorReturnType): returnValue is StructMemberDef {
  return Array.isArray(returnValue) && returnValue.length === 3 && typeof returnValue[0] === 'string';
}

// Return a StructMemberDef - should only call this function when it is indeed a StructMemberDef
export function getStructMemberDef(returnValue: AnalyzerVisitorReturnType): StructMemberDef {
  if (isStructMemberDef(returnValue)) {
    return returnValue;
  }
  return ['', createDefaultRange(), undefined];
}

// Whether the return value is of type MemoryBlock array
export function areMemoryBlocks(returnValue: AnalyzerVisitorReturnType): returnValue is MemoryBlock[] {
  return Array.isArray(returnValue) && returnValue.length >= 1 && isMemoryBlock(returnValue[0]);
}

// Return a MemoryBlock array - should only call this function when it is indeed a MemoryBlock array
export function getMemoryBlocks(returnValue: AnalyzerVisitorReturnType): MemoryBlock[] {
  if (areMemoryBlocks(returnValue)) {
    return returnValue;
  }
  return [createNewMemoryBlock({})];
}

// Whether the return value is of type MemoryPointer array
export function areMemoryPointers(returnValue: AnalyzerVisitorReturnType): returnValue is MemoryPointer[] {
  return Array.isArray(returnValue) && returnValue.length >= 1 && isMemoryPointer(returnValue[0]);
}

// Return a MemoryPointer array - should only call this function when it is indeed a MemoryPointer array
export function getMemoryPointers(returnValue: AnalyzerVisitorReturnType): MemoryPointer[] {
  if (areMemoryPointers(returnValue)) {
    return returnValue;
  }
  return [createNewMemoryPointer({})];
}
