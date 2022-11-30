import { ASTType } from './ASTNode';
import { POINTER_TYPE_SUFFIX, STRUCT_TYPE_PREFIX } from '../../constants';

export function getActualType(type: ASTType): string {
  if (type.desugaredQualType) {
    return type.desugaredQualType;
  }
  return type.qualType;
}

// extract "A" from "struct A" if any. If it is a struct pointer or something else, return undefined
export function extractedStructType(type: string): string | undefined {
  if (type.startsWith(STRUCT_TYPE_PREFIX) && !type.endsWith(POINTER_TYPE_SUFFIX)) {
    return type.substring(STRUCT_TYPE_PREFIX.length);
  }
}

// extract "int *" from "int **" if any. If it is not a pointer, return undefined
export function dereferencedPointerType(type: string): string | undefined {
  if (type.endsWith(POINTER_TYPE_SUFFIX)) {
    return type.substring(0, type.length - 1).trim();
  }
}
