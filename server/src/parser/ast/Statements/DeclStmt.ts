import { ASTNode, ASTNodeWithType } from '../ASTNode';
import { StructDecl } from '../Declarations/StructDecl';
import { VarDecl } from '../Declarations/VarDecl';
import { ASTStmt } from './ASTStmt';

// represent a declaration statement (can be a variable, or struct definition in our scope)
export interface DeclStmt extends ASTStmt {
  kind: 'DeclStmt';
  inner: (StructDecl | VarDecl)[]; // the declarations (might have more than 1 on one line, such as int a, b;)
}

export function isDeclStmt(node: ASTNode): node is DeclStmt {
  return node.kind === 'DeclStmt';
}
