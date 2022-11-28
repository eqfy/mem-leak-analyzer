// COMMENTED OUT CODE IS ON PURPOSE - WE DO NOT NEED IT. KEPT IT JUST IN CASE.

export interface ASTNode {
  id: string;
  kind: string;
  range: ASTRange;
}

/*
    describes the type of a variable, field, return type of a function, etc
    we are gonna need to find a reliable way to parse this string, as it could be a user defined type as well, like "struct A *"
    thought of like a "return type" in all situations
    for example, the qualType for sizeof calls is always unsigned long

    we might have (and want) the desugared version as well, as that is the version after consuming typedefs (similar to macros)
*/
export interface ASTNodeWithType extends ASTNode {
  type: ASTType;
}

export interface ASTType {
  qualType: string;
  desugaredQualType?: string;
}

export function isASTNodeWithType(node: ASTNode): node is ASTNodeWithType {
  return 'type' in node;
}

export interface ASTRange {
  begin: {
    offset: number;
  };
  end: {
    offset: number;
  };
}

export function createDefaultRange(): ASTRange {
  return {
    begin: {
      offset: 0
    },
    end: {
      offset: 0
    }
  };
}

// keep for now

//
// export interface ASTRange {
//     begin: {
//         offset: number,
//         // col: number,
//         // tokLen: number
//     },
//     end: {
//         offset: number,
//         // col: number,
//         // line?: number,
//         // tokLen: number
//     }
// }

// export interface ASTLocation {
//     offset: number,
//     line: number,
//     col: number,
//     tokLen: number
// }
