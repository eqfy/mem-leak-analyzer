import { createDefaultRange } from '../ast/ASTNode';
import { AnalyzerVisitorReturnType } from './AnalyzerVisitor';
import { createNewMemoryBlock, createNewMemoryPointer, MemoryBlock, MemoryPointer, StructMember } from './ProgramState';

// Whether the return value is of type StructMember
export function isStructMember(returnValue: AnalyzerVisitorReturnType): returnValue is StructMember {
  return Array.isArray(returnValue);
}

// Return a StructMember - should only call this function when it is indeed a StructMember
export function getStructMember(returnValue: AnalyzerVisitorReturnType): StructMember {
  if (isStructMember(returnValue)) {
    return returnValue;
  }
  return ['', createDefaultRange(), undefined];
}

// Whether the return value is of type MemoryBlock
export function isMemoryBlock(returnValue: AnalyzerVisitorReturnType): returnValue is MemoryBlock {
  return typeof returnValue === 'object' && 'existence' in returnValue;
}

// Return a MemoryBlock - should only call this function when it is indeed a MemoryBlock
export function getMemoryBlock(returnValue: AnalyzerVisitorReturnType): MemoryBlock {
  if (isMemoryBlock(returnValue)) {
    return returnValue;
  }
  return createNewMemoryBlock({});
}

// Whether the return value is of type MemoryPointer
export function isMemoryPointer(returnValue: AnalyzerVisitorReturnType): returnValue is MemoryPointer {
  return typeof returnValue === 'object' && 'canBeInvalid' in returnValue;
}

// Return a MemoryBlock - should only call this function when it is indeed a MemoryPointer
export function getMemoryPointer(returnValue: AnalyzerVisitorReturnType): MemoryPointer {
  if (isMemoryPointer(returnValue)) {
    return returnValue;
  }
  return createNewMemoryPointer({});
}
