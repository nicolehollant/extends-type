# extends-type
runtime javascript type assertion with a familiar syntax for typescript lovers

## installation

```sh
npm i extends-type
```

## usage

```js
import { extendsType } from 'extends-type'

extendsType({ type: 'string', value: 'Hello World' }, '"Hello World"') // true
extendsType({ type: 'string', value: 'Hello World' }, 'string') // true
extendsType({ type: 'typeof', value: () => { console.log('hi') } }, '() => void') // true
extendsType({ type: 'JSON', value: { id: 1 } }, '{ id: 1 }') // true

extendsType({ type: 'string', value: 'Not Hello World' }, '"Hello World"') // false
extendsType({ type: 'typeof', value: 1 }, 'string') // false
extendsType({ type: 'typeof', value: () => { console.log('hi') } }, '() => number') // false
extendsType({ type: 'JSON', value: { id: 1 } }, '{ id: 2 }') // false
```