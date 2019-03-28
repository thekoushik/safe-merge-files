# safe-merge-files
Merge two files like git

# Install
```bash
npm install safe-merge-files
```

# API
## function(oldFile, newFile[, options][, callback])
Content of `oldFile` and `newFile` will be merged and written into `newFile`.
If conflict occurs, it will create [git like merge conflict result](https://help.github.com/en/articles/resolving-a-merge-conflict-using-the-command-line) which should be resolved manually. To resolve conflict automatically, use `force` option.
- `oldFile` [&lt;string&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type)
	Old filename
- `newFile` [&lt;string&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type)
	New filename
- `options` [&lt;object&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
	see [Merge Options](#merge-options)
- `callback` [&lt;Function&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)

# Merge Options
- `outputFile` [&lt;string&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type)
	Defaults to `null` 
	If specified, the merged output will be written in `outputFile` instead of `newFile`
- `force` [&lt;boolean&gt;](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type)
	Defaults to `false`
	If set to `true`, conflicts will be resolved by prefering new changes.

# Usage
```javascript
var safeMergeFiles = require('safe-merge-files');

safeMergeFiles('before-change.txt', 'after-change.txt', {
  force: true
},function(err){
	console.log('Done');
})
```

# Run Test
```
npm test
```
