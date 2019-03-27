var safeMergeFiles = require('../');

safeMergeFiles(__dirname+'/demo1.txt',__dirname+'/demo3.txt',{outputFile:__dirname+'/merged.txt'},function(err,conflict){
	console.log(conflict?'Conflict':'No Conflict');
})