import {Diagnostic} from "vscode-languageserver";
import {ASTRange} from "../ast/ASTNode";
import {TextDocument} from "vscode-languageserver-textdocument";

export type MemoryError = Diagnostic;

export default class ErrBuilder {
    static createMemErr(range: ASTRange, message: string, severity: ErrSeverity, textDocument: TextDocument): MemoryError {
        const diagRange = {
            start: textDocument.positionAt(range.begin.offset),
            end: textDocument.positionAt(range.end.offset + 1),
        }
       return Diagnostic.create(diagRange, message, severity);
    }
}

export enum ErrSeverity {
    /**
     * Reports an error.
     */
    Error = 1, // red
    /**
     * Reports a warning.
     */
    Warning = 2, // orange
    /**
     * Reports an information.
     */
    Information = 3,
    /**
     * Reports a hint.
     */
    Hint = 4
}
