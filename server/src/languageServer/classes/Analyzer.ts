import {Diagnostic} from "vscode-languageserver";
import { TextDocument } from 'vscode-languageserver-textdocument';

export default class Analyzer {
    public getAllErrors(cAST: object, textDocument: TextDocument): Diagnostic[] {
        return [];
    }
}
