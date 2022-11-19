// COMMENTED OUT CODE IS ON PURPOSE - WE DO NOT NEED IT. KEPT IT JUST IN CASE.

import {Visitor} from "../classes/Visitor";

export interface ASTNode {
    id: string;
    kind: string;
    range: ASTRange;
    accept<T, U>(v: Visitor<T, U>, t: T): U;
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

export interface ASTRange {
        begin: {
            offset: number
        },
        end: {
            offset: number
        }
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
