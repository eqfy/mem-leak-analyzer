export interface ASTNode {
    id: string;
    kind: string;
    loc: ASTLocation;
    range: ASTRange;
}

export interface ASTNodeWithType extends ASTNode {
    type: {
        qualType: string;
    }
}

export interface ASTLocation {
    offset: number,
    line: number,
    col: number,
    tokLen: number
}

export interface ASTRange {
    range: {
        begin: {
            offset: number,
            col: number,
            tokLen: number
        },
        end: {
            offset: number,
            col: number,
            tokLen: number
        }
    }
}

