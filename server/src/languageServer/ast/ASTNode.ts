// COMMENTED OUT CODE IS ON PURPOSE - WE DO NOT NEED IT. KEPT IT JUST IN CASE.

export interface ASTNode {
    id: string;
    kind: string;
    // loc: ASTLocation;
    range: ASTRange;
}

/*
    describes the type of a variable, field, return type of a function, etc
    we are gonna need to find a reliable way to parse this string, as it could be a user defined type as well, like "struct A *"
    thought of like a "return type" in all situations
    for example, the qualType for sizeof calls is always unsigned long
*/
export interface ASTNodeWithType extends ASTNode {
    type: {
        qualType: string;
    }
}

// export interface ASTLocation {
//     offset: number,
//     line: number,
//     col: number,
//     tokLen: number
// }

export interface ASTRange {
        begin: {
            offset: number,
            // col: number,
            // tokLen: number
        },
        end: {
            offset: number,
            // col: number,
            // line?: number,
            // tokLen: number
        }
}

