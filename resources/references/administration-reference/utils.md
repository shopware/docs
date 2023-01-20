# Utils

This is an overview of all the utility functions bound to the shopware global object. Utility functions provide many useful shortcuts for common tasks, see how to use them in your plugin [here](../../../guides/plugins/plugins/administration/using-utils). Or see the code that registers them [here](https://github.com/shopware/platform/blob/v6.3.4.1/src/Administration/Resources/app/administration/src/core/service/util.service.js)

## General functions

| Function | Description | Link |
| :--- | :--- | :--- |
| createId | Returns a uuid string in hex format. Generated with [uuid](https://www.npmjs.com/package/uuid) | [link](https://lodash.com/docs/4.17.15#create) |
| throttle | Creates a `throttled` function that only invokes `func` at most once per every `wait` milliseconds. | [link](https://lodash.com/docs/4.17.15#throttle) |
| debounce | Creates a `debounced` function that delays invoking `func` until after `wait` milliseconds have elapsed since the last time the `debounced` function was invoked. | [link](https://lodash.com/docs/4.17.15#debounce) |
| flow | Creates a function that returns the result of invoking the given functions with the `this` binding of the created function, where each successive invocation is supplied the return value of the previous. | [link](https://lodash.com/docs/4.17.15#flow) |
| get | Gets the value at `path` of `object` | [link](https://lodash.com/docs/4.17.15#get) |

## Object

| Function | Description | Link |
| :--- | :--- | :--- |
| deepCopyObject | Deep copy an object |  |
| hasOwnProperty | Shorthand method for `Object.prototype.hasOwnProperty` |  |
| getObjectDiff | Gets a simple recursive diff of two objects. Does not consider an entity schema or entity related logic. |  |
| getArrayChanges | Check if the compared array has changes. |  |
| cloneDeep | Creates recursively a clone of value. | [link](https://lodash.com/docs/4.17.15#cloneDeep) |
| merge | This method is like \_.assign except that it recursively merges own and inherited enumerable string keyed properties of source objects into the destination object. | [link](https://lodash.com/docs/4.17.15#merge) |
| mergeWith | This method is like \_.merge except that it accepts customizer which is invoked to produce the merged values of the destination and source properties. | [link](https://lodash.com/docs/4.17.15#mergeWith) |
| deepMergeObject | Deep merge two objects |  |
| get | Gets the value at `path` of `object` | [link](https://lodash.com/docs/4.17.15#get) |
| set | Sets the value at `path` of `object` | [link](https://lodash.com/docs/4.17.15#set) |
| pick | Creates an object composed of the picked `object` properties. | [link](https://lodash.com/docs/4.17.15#pick) |

## Debug

| Function | Description |
| :--- | :--- |
| warn | General logging function which provides a unified style of log messages for developers. Please keep the log in mind. Messages will be displayed in the developer console when they're running the application in development mode. |
| debug | The same as `warn` but instead of `console.warn` it uses `console.error`. |

## Format

| Function | Description |
| :--- | :--- |
| currency | Converts a number to a formatted currency. Especially helpful for template filters. |
| date | Formats a Date object to a localized string with the [native `Intl.DateTimeFormat` method](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat) |
| fileSize | Formats a number of bytes to a string with a unit |
| md5 | Generates a md5 hash with [md5-es](https://www.npmjs.com/package/md5-es) of a given value. |

## Dom

| Function | Description |
| :--- | :--- |
| getScrollbarHeight | Returns the scrollbar height of an HTML element. |
| getScrollbarWidth | Returns the scrollbar width of an HTML element. |
| copyToClipboard | Uses the browser's copy function to copy a string |

## String

| Function | Description | Link |
| :--- | :--- | :--- |
| capitalizeString | Converts the first character of `string` to upper case and the remaining to lower case. | [link](https://lodash.com/docs/4.17.15#capitalize) |
| camelCase | Converts `string` to camel case. | [link](https://lodash.com/docs/4.17.15#camelCase) |
| kebabCase | Converts `string` to kebab case. | [link](https://lodash.com/docs/4.17.15#kebabCase) |
| snakeCase | Converts `string` to snake case. | [link](https://lodash.com/docs/4.17.15#snakeCase) |
| md5 | Generates a md5 hash with [md5-es](https://www.npmjs.com/package/md5-es) of a given value. |  |
| isEmptyOrSpaces | Gets if the content of the string is really empty. This does also removes any whitespaces that might exist in the text. |  |
| isUrl | Checks if the provided value is a URL |  |
| isValidIp | Checks if the provided value is an IP with this [Regex](https://regex101.com/r/qHTUIe/1) |  |

## Type

| Function | Description | Link |
| :--- | :--- | :--- |
| isObject | Checks if `value` is the [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types) of `Object`. _\(e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`\)_ | [link](https://lodash.com/docs/4.17.15#isObject) |
| isPlainObject | Checks if `value` is a plain object, that is, an object created by the `Object` constructor or one with a `[[Prototype]]` of `null`. | [link](https://lodash.com/docs/4.17.15#isPlainObject) |
| isEmpty | Checks if `value` is an empty object, collection, map, or set. | [link](https://lodash.com/docs/4.17.15#isEmpty) |
| isRegExp | Checks if `value` is classified as a `RegExp` object. | [link](https://lodash.com/docs/4.17.15#isRegExp) |
| isArray | Checks if `value` is classified as an `Array` object. | [link](https://lodash.com/docs/4.17.15#isArray) |
| isFunction | Checks if `value` is classified as a `Function` object. | [link](https://lodash.com/docs/4.17.15#isFunction) |
| isDate | Checks if `value` is classified as a `Date` object. | [link](https://lodash.com/docs/4.17.15#isDate) |
| isString | Checks if `value` is classified as a `String` primitive or object. | [link](https://lodash.com/docs/4.17.15#isString) |
| isBoolean | Checks if value is classified as a `boolean` primitive or object. | [link](https://lodash.com/docs/4.17.15#isBoolean) |
| isEqual | Performs a deep comparison between two values to determine if they are equivalent. | [link](https://lodash.com/docs/4.17.15#isEqual) |
| isNumber | Checks if `value` is classified as a Number primitive or object. | [link](https://lodash.com/docs/4.17.15#isNumber) |
| isUndefined | Checks if `value` is `undefined`. | [link](https://lodash.com/docs/4.17.15#isUndefined) |

## Filereader

| Function | Description | Link |
| :--- | :--- | :--- |
| readAsArrayBuffer | Reads a `file` as an `ArrayBuffer` | [link](https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsArrayBuffer) |
| readAsDataURL | Reads a `file` as a `Data-URL` | [link](https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL) |
| readAsText | Reads a `file` as `text` | [link](https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsText) |
| getNameAndExtensionFromFile | Gets the `name` and `extension` from a file |  |
| getNameAndExtensionFromUrl | Gets the `name` and `extension` from a URL |  |

## Sort

| Function | Description |
| :--- | :--- |
| afterSort | Sorts the elements by their after id property chain |

## Array

| Function | Description | Link |
| :--- | :--- | :--- |
| flattenDeep | Recursively flattens `array`. | [link](https://lodash.com/docs/4.17.15#flattenDeep) |
| remove | Removes all elements from `array` that predicate returns truthy for and returns an array of the removed elements | [link](https://lodash.com/docs/4.17.15#remove) |
| slice | Creates a slice of `array` from `start` up to, but not including, `end`. | [link](https://lodash.com/docs/4.17.15#slice) |
| uniqBy | This method is like [`_.uniq`](https://lodash.com/docs/4.17.15#uniq) except that it accepts `iteratee` which is invoked for each element in `array` to generate the criterion by which uniqueness is computed. | [link](https://lodash.com/docs/4.17.15#uniqBy) |
