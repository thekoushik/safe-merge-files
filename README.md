# safe-merge-files

[![npm version](http://img.shields.io/npm/v/safe-merge-files.svg)](https://npmjs.org/package/safe-merge-files "View this project on npm") [![issues](https://img.shields.io/github/issues/thekoushik/safe-merge-files.svg)](https://github.com/thekoushik/safe-merge-files/issues) ![contributors](https://img.shields.io/github/contributors/thekoushik/safe-merge-files.svg)

Merge two files like git

# Install
```bash
npm install safe-merge-files
```

# API
## safeMergeFiles(oldFile, newFile[, options][, callback])
Content of `oldFile` and `newFile` will be merged and written into `newFile`.
If conflict occurs, it will create [git like merge conflict result](https://help.github.com/en/articles/resolving-a-merge-conflict-using-the-command-line) which should be resolved manually. To resolve conflict automatically, use `force` option.
- `oldFile` [&lt;string&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type)
	Old filename
- `newFile` [&lt;string&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type)
	New filename
- `options` [&lt;object&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
	- `outputFile` [&lt;string&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type)
		Defaults to `null`.  If specified, the merged output will be written in `outputFile` instead of `newFile`
	- `force` [&lt;boolean&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type)
		Defaults to `false`. If set to `true`, conflicts will be resolved by prefering new changes.
- `callback` [&lt;Function&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)
	- Error [&lt;Error&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)
		Emitted when an error occurs.
	- Change Flag [&lt;Integer&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type)
		0 = no change, 1 = no conflict, -1 = conflict

## safeMergeFiles.Sync(oldFile, newFile[, options])
Content of `oldFile` and `newFile` will be merged and written into `newFile`.
If conflict occurs, it will create [git like merge conflict result](https://help.github.com/en/articles/resolving-a-merge-conflict-using-the-command-line) which should be resolved manually. To resolve conflict automatically, use `force` option.
- `oldFile` [&lt;string&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) | [&lt;ReadStream&gt;](https://nodejs.org/api/fs.html#fs_class_fs_readstream)
	Old filename or a [Readable Stream](https://nodejs.org/api/stream.html#stream_class_stream_readable)
- `newFile` [&lt;string&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) | [&lt;ReadStream&gt;](https://nodejs.org/api/fs.html#fs_class_fs_readstream)
	New filename or a [Readable Stream](https://nodejs.org/api/stream.html#stream_class_stream_readable)
- `options` [&lt;object&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
	- `outputFile` [&lt;string&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type)
		Defaults to `null`.  If specified, the merged output will be written in `outputFile` instead of `newFile`
	- `force` [&lt;boolean&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type)
		Defaults to `false`. If set to `true`, conflicts will be resolved by prefering new changes.
	- `stream` [&lt;boolean&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type)
		Defaults to `false`. If set to true, it returns a [Readable Stream](https://nodejs.org/api/stream.html#stream_class_stream_readable) that can be consumed or piped.
	- Returns: [&lt;ReadStream&gt;](https://nodejs.org/api/fs.html#fs_class_fs_readstream) | [&lt;Integer&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type)
		If `options.stream` is `false`, any of [0 = no change, 1 = no conflict, -1 = conflict] is returned.

# Usage
## Simple
```javascript
var safeMergeFiles = require('safe-merge-files');

safeMergeFiles('before-change.txt', 'after-change.txt',function(err,change){
	if(change==0) console.log('No change');
	else if(change==1) console.log('Modified');
	else console.log('Conflict - please resolve it mannually');
})
```

## Force Apply Incoming Changes
```javascript
var safeMergeFiles = require('safe-merge-files');

safeMergeFiles('before-change.txt', 'after-change.txt',{
	force: true
},function(err,change){
	if(change==0) console.log('No change');
	else if(change==1) console.log('Modified');
	else console.log('Conflict - resolved');
})
```

## Sync
```javascript
var safeMergeFiles = require('safe-merge-files');

var stream= safeMergeFiles.Sync(fs.createReadStream("old_file"), fs.createReadStream("new_file"), {
 stream:true
});
var output=fs.createWriteStream("output_file");
stream.pipe(output);
```

# Run Test
```
npm test
```
