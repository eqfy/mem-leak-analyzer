import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import path from 'path';

export default class CParser {
  static getAST(cProgram: string): object {
    const output = execSync(`echo "${cProgram}" | clang -x c - -Xclang -ast-dump=json -fsyntax-only`, {
      maxBuffer: Number.MAX_SAFE_INTEGER,
      encoding: 'utf8'
    });
    const ast = CParser.removeLibs(JSON.parse(output));
    writeFileSync(path.join(__dirname, 'unfiltered.json'), output, {
      flag: 'w'
    });
    writeFileSync(path.join(__dirname, 'filtered.json'), JSON.stringify(ast, null, 2), {
      flag: 'w'
    });
    return ast as unknown as object;
  }
  static removeLibs(ast: any): object {
    let i = 0;
    const arr = ast.inner;
    while (i < arr.length) {
      if (CParser.isNodeToRemove(arr[i])) {
        arr.splice(i, 1);
      } else {
        ++i;
      }
    }
    return { ast: arr };
  }

  static isNodeToRemove(node: any): true {
    return (
      node.loc.includedFrom !== undefined ||
      node.isImplicit ||
      (node.loc.file !== '<stdin>' &&
        (node.loc.offset === undefined || node.loc.line === undefined || node.loc.col === undefined))
    );
  }
}
