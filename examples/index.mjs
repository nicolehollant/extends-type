import { extendsType } from '../dist/index.mjs'

const sayHi = () => {
  console.log('hi')
}
console.log(extendsType({ type: 'string', value: 'Hello World' }, '"Hello World"')) // true
console.log(extendsType({ type: 'string', value: 'Hello World' }, 'string')) // true
console.log(extendsType({ type: 'typeof', value: sayHi }, '() => void')) // true
console.log(extendsType({ type: 'JSON', value: { id: 1 } }, '{ id: 1 }')) // true

console.log(extendsType({ type: 'string', value: 'Not Hello World' }, '"Hello World"')) // false
console.log(extendsType({ type: 'typeof', value: 1 }, 'string')) // false
console.log(extendsType({ type: 'typeof', value: sayHi }, '() => number')) // false
console.log(extendsType({ type: 'JSON', value: { id: 1 } }, '{ id: 2 }')) // false
