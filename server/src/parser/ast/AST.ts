import { VarDecl } from './Declarations/VarDecl';
import { StructDecl } from './Declarations/StructDecl';
import { FunctionDecl } from './Declarations/FunctionDecl';
import { ASTNode } from "./ASTNode";

// represent the root of the AST
export interface AST extends ASTNode {
    /* have a list of declarations:
     - VarDecl - global variables
     - StructDecl - global structs
     - FunctionDecl - functions
    */
    inner: (VarDecl | StructDecl | FunctionDecl)[];
}
