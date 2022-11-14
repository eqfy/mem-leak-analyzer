import {Diagnostic} from "vscode-languageserver";
import { TextDocument } from 'vscode-languageserver-textdocument';

export default class Analyzer {
    public getAllErrors(cProgramAST: object, textDocument: TextDocument): Diagnostic[] {
        return [];
    }
}
