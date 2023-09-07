import { default as ts } from 'typescript'

/**
 *
 * @param {{ type: 'string', value: string } | { type: 'JSON', value: unknown } | { type: 'typeof', value: string } | { type: 'raw', value: unknown } } val
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
    if (val.type === 'raw') {
      return `type A = ${val.value}`
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
 * @param {{ type: 'string', value: string } | { type: 'JSON', value: unknown } | { type: 'typeof', value: string } | { type: 'raw', value: unknown } } value
 * @param {string} typeString
 * @param {{ filename?: string, debug?: boolean } | undefined} options
 * @returns boolean
 */
export function extendsType(value, typeString, options = { filename: 'extendsType.ts', debug: false }) {
  const filename = options?.filename || 'extendsType.ts'
  const template = `${parseExtendsTypeValue(value)}; const extendsType: A extends ${typeString} ? true : false`
  if (options?.debug) {
    console.log(template)
  }
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

export default extendsType
