import { VarDecl } from './Declarations/VarDecl';
import { StructDecl } from './Declarations/StructDecl';
import { FunctionDecl } from './Declarations/FunctionDecl';

// represent the root of the AST
export interface AST {
    /* have a list of declarations:
     - VarDecl - global variables
     - StructDecl - global structs
     - FunctionDecl - functions
    */
    ast: (VarDecl | StructDecl | FunctionDecl)[];
}
