import { createDefaultRange } from '../parser/ast/ASTNode';
import { AnalyzerVisitorReturnType } from '../analyzer/AnalyzerVisitor';
import { createNewMemoryBlock, createNewMemoryPointer, isMemoryBlock, isMemoryPointer, MemoryBlock, MemoryPointer, StructMemberDef } from '../analyzer/ProgramState';

// Whether the return value is of type StructMemberDef
export function isStructMemberDef(returnValue: AnalyzerVisitorReturnType): returnValue is StructMemberDef {
  return Array.isArray(returnValue) && returnValue.length === 3 && typeof returnValue[0] === 'string';
}

// Return a StructMemberDef - should only call this function when it is indeed a StructMemberDef
export function getStructMemberDef(returnValue: AnalyzerVisitorReturnType): StructMemberDef {
  if (isStructMemberDef(returnValue)) {
    return returnValue;
  }
  return ['', createDefaultRange(), 'void'];
}

