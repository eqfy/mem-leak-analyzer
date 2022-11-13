import { TextDocument } from "vscode-languageserver-textdocument";
import { Range , Position} from 'vscode-languageserver/node';

export function findEndOfToken(textDocument: TextDocument, line: number, column: number): Position{
  const currRange: Range = {start: { line: line, character: column }, end: { line: line, character: column + 1 }};
  let currChar =  textDocument.getText(currRange);
  while(!currChar.match(/\s/)) {
    currRange.start.character += 1;
    currRange.end.character += 1;
    currChar = textDocument.getText(currRange);
  }
  return currRange.end;
}
