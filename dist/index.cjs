const ts = require('typescript')

/**
 *
 * @param {{ type: 'string', value: string } | { type: 'JSON', value: unknown } | { type: 'typeof', value: string } } val
 * @returns string
 */
function parseExtendsTypeValue(val) {
  try {
    if (val.type === 'string') {
      return `type A = "${val.value}"`
    }
    if (val.type === 'JSON') {
      return `type A = ${JSON.stringify(val.value)}`
    }
    return `const _val = ${val.value}; type A = typeof _val`
  } catch (error) {
    if ('value' in val) {
      return `type A = ${val.value}`
    }
    return `type A = ${val}`
  }
}

/**
 *
 * @param {{ type: 'string', value: string } | { type: 'JSON', value: unknown } | { type: 'typeof', value: string } } value
 * @param {string} typeString
 * @param {string | undefined} filename
 * @returns boolean
 */
function extendsType(value, typeString, filename = 'extendsType.ts') {
  const template = `${parseExtendsTypeValue(value)}; const extendsType: A extends ${typeString} ? true : false`
  const sourceFile = ts.createSourceFile(filename, template, 99)
  const customCompilerHost = {
    getSourceFile: (name, languageVersion) => {
      if (name === filename) return sourceFile
      return ts.createCompilerHost({ strict: true }).getSourceFile(name, languageVersion)
    },
    writeFile: (_filename, _data) => {},
    getDefaultLibFileName: () => 'lib.d.ts',
    useCaseSensitiveFileNames: () => false,
    getCanonicalFileName: (filename) => filename,
    getCurrentDirectory: () => '',
    getNewLine: () => '\n',
    getDirectories: () => [],
    fileExists: () => true,
    readFile: () => '',
  }
  const program = ts.createProgram([filename], {}, customCompilerHost)
  const typeChecker = program.getTypeChecker()
  let result = false
  function recursivelyPrintVariableDeclarations(node, sourceFile) {
    if (
      node.kind === ts.SyntaxKind.VariableDeclaration &&
      typeChecker.typeToString(typeChecker.getTypeAtLocation(node), node) === 'true'
    ) {
      result = true
    }
    node.forEachChild((child) => recursivelyPrintVariableDeclarations(child, sourceFile))
  }
  recursivelyPrintVariableDeclarations(sourceFile, sourceFile)
  return result
}

module.exports = {
  extendsType,
}
