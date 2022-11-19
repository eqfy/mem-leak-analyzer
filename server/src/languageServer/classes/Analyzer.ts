import {TextDocument} from 'vscode-languageserver-textdocument';
import {testing} from "../../constants";
import ErrBuilder, {ErrSeverity, MemoryError} from "./ErrBuilder";
import {AST} from "../ast/AST";

export default class Analyzer {
    public getAllErrors(cProgramAST: AST, textDocument: TextDocument): MemoryError[] {
        const diagnostics: MemoryError[] = [];
        // visitor will be called here or whatever is needed to produce the errors
        return testing ? diagnostics : this.getTestData(textDocument);
    }

    public getTestData(textDocument: TextDocument) : MemoryError[] {
        const diagnostics: MemoryError[] = [];
        diagnostics.push(ErrBuilder.createMemErr({
            begin: {
                offset: 0,
            },
            end: {
                offset: 27,
            }
        }, "testing 123", ErrSeverity.Error, textDocument))
        return diagnostics;
    }
}
