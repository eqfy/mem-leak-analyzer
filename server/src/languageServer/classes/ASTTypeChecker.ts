import { ASTType } from '../ast/ASTNode';
import { POINTER_TYPE_SUFFIX, STRUCT_TYPE_PREFIX } from '../constants';

export function getActualType(type: ASTType): string {
  if (type.desugaredQualType) {
    return type.desugaredQualType;
  }
  return type.qualType;
}

// extract "A" from "struct A" if any. If it is a struct pointer or something else, return undefined
export function extractStructType(type: ASTType): string | undefined {
  const actualType = getActualType(type);
  if (actualType.startsWith(STRUCT_TYPE_PREFIX) && !actualType.endsWith(POINTER_TYPE_SUFFIX)) {
    return actualType.substring(STRUCT_TYPE_PREFIX.length);
  }
  return undefined;
}

// whether the type is a pointer (ending in *)
export function isPointerType(type: ASTType): boolean {
  const actualType = getActualType(type);
  return actualType.endsWith(POINTER_TYPE_SUFFIX);
}