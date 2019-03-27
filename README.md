# safe-merge-files
Merge two files like git

# Install
```bash
npm install safe-merge-files
```

# API
```javascript
var safeMergeFiles = require('safe-merge-files');

safeMergeFiles('before-change.txt','after-change.txt',function(err,conflict){
	console.log(conflict?'Conflict':'No Conflict');
})
```