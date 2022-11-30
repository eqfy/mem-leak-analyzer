import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import path from 'path';
import { AST } from './ast/AST';
import { testing } from '../constants';

export default class CParser {
  static getAST(cProgram: string): AST {
    console.log(cProgram);
    try {
      const output = execSync(`echo "${cProgram}" | clang -x c - -Xclang -ast-dump=json -fsyntax-only`, {
        maxBuffer: Number.MAX_SAFE_INTEGER,
        encoding: 'utf8'
      });
      const ast = CParser.removeLibs(JSON.parse(output));
      // walk the tree recursively, then case statement for each node type, assign accept => this.visit
      if (testing) CParser.testing(output, ast);
      return ast;
    } catch (err) {
      console.error(`Your code did not compile with Clang, see error here\n${err}`);
      return {
        id: 'error id',
        kind: 'C group9 ast',
        range: { begin: { offset: 0 }, end: { offset: 999 } },
        inner: []
      };
    }
  }

  static removeLibs(ast: any): AST {
    let i = 0;
    const arr = ast.inner;
    while (i < arr.length) {
      if (CParser.isNodeToRemove(arr[i])) {
        arr.splice(i, 1);
      } else {
        ++i;
      }
    }
    const astRange = { range: { begin: { offset: 0 }, end: { offset: 0 } } };
    if (arr.length > 0) astRange.range.end.offset = arr[arr.length - 1].range.end.offset;
    return { id: 'ast', kind: 'C group9 ast', range: astRange.range, inner: arr };
  }

  static isNodeToRemove(node: any): true {
    return (
      node.loc.includedFrom !== undefined ||
      node.isImplicit ||
      (node.loc.file !== '<stdin>' &&
        (node.loc.offset === undefined || node.loc.line === undefined || node.loc.col === undefined))
    );
  }

  private static testing(output: string, ast: object) {
    writeFileSync(path.join(__dirname, '../../../unfilteredAST.json'), output, {
      flag: 'w'
    });
    writeFileSync(path.join(__dirname, '../../../filteredAST.json'), JSON.stringify(ast, null, 2), {
      flag: 'w'
    });
  }
}
