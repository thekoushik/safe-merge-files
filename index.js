var diff = require("diff");
var NodeStream = require('stream');
var fs = require('fs');
var EE = require('events').EventEmitter;
var sleep=require('deasync').sleep;

function readStreamSync(readStream){
    var output='';
	var loop=true;
	readStream.on('error',function(e){
		loop=false;
		throw e;
    })
    readStream.on('readable',function(){
        var chunk;
        if(chunk=readStream.read())
            output+=chunk.toString();
        else
            loop=false;
    });
    readStream.on('close',function(){
        loop=false;
    })
    while(loop) sleep(100);
    return output;
}

function Async(oldFile,newFile,options,callback){
	if(typeof options=='function'){
		callback=options;
		options={};
	}
	var op=Object.assign({
		outputFile:null,
		force:false
	},options||{});
	var source=fs.readFileSync(oldFile,{encoding:'utf8'});
	var patch=diff.structuredPatch('A','B',source,fs.readFileSync(newFile,{encoding:'utf8'}),'','');
	if(patch.hunks.length==0)
		callback(null,0);
	else{
		source=source.split('\n');
		var writer=fs.createWriteStream(op.outputFile || newFile);
		var lastSymbol=null;
		var hunkPending=Boolean(patch.hunks[0].oldStart>1);
		var pendingRemoves=[];
		var pendingAdditions=[];
		var reader=new EE();
		var conflict = false;
		var writePendings=function(normalLine,addToPendingRemoves,cb){
			var strToBeWritten=[];
			if(hunkPending){
				hunkPending=false;
				var preArr;
				if(hunkIndex==0){
					preArr=source.slice(0,patch.hunks[hunkIndex].oldStart-1);
				}else if(hunkIndex<patch.hunks.length){
					preArr=source.slice(patch.hunks[hunkIndex-1].oldStart+patch.hunks[hunkIndex-1].oldLines-1,patch.hunks[hunkIndex].oldStart-1);
				}else{//lastHunk
					preArr=source.slice(patch.hunks[hunkIndex-1].oldStart+patch.hunks[hunkIndex-1].oldLines-1);
				}
				if(preArr.length)
					strToBeWritten.push(preArr.join('\n'));
			}
			if(!pendingRemoves.length && pendingAdditions.length){//only addition
				strToBeWritten.push(pendingAdditions.join('\n'));
			}else if(pendingRemoves.length && pendingAdditions.length){//conflict
				conflict=true;
				if(options.force){//prefer additions
					strToBeWritten.push(pendingAdditions.join('\n'));
				}else{
					strToBeWritten.push(`<<<<<<< HEAD\n${pendingRemoves.join('\n')}\n=======\n${pendingAdditions.join('\n')}\n>>>>>>> New-HEAD`);
				}
			}
			if(normalLine)
				strToBeWritten.push(normalLine.substr(1));
			var writeFinishCallback=function(err){
				pendingRemoves=[];
				pendingAdditions=[];
				if(addToPendingRemoves) pendingRemoves.push(addToPendingRemoves);
				if(cb) cb();
				else reader.emit('data');
			};
			if(!strToBeWritten.length)
				writeFinishCallback(null);
			else
				writer.write(strToBeWritten.join('\n')+(cb?'':'\n'),writeFinishCallback);
		}
		var hunkIndex=0;
		var hunkLineIndex=-1;
		reader.on('data',function(){
			++hunkLineIndex;
			if(hunkLineIndex>=patch.hunks[hunkIndex].lines.length){
				++hunkIndex; hunkLineIndex=0;
				hunkPending=true;
			}
			if(hunkIndex>=patch.hunks.length)
				return reader.emit('end');//may need resume
			var line=patch.hunks[hunkIndex].lines[hunkLineIndex];
			if(line[0]==' '){
				writePendings(line);
				lastSymbol=null;
			}else if(line[0]=='-'){
				if(!lastSymbol || lastSymbol=='-'){//was normal or same
					pendingRemoves.push(line.substr(1));
					lastSymbol='-';
					return reader.emit('data');
				}else{//was +
					lastSymbol='-';
					writePendings(false,line.substr(1));
				}
			}else if(line[0]=='+'){
				pendingAdditions.push(line.substr(1));
				lastSymbol='+';
				return reader.emit('data');
			}else{//skip \ No newline at end of file
				if(lastSymbol){
					lastSymbol=null;
					writePendings();
				}else
					return reader.emit('data');
			}
		})
		reader.on('end',function(){
			writePendings(false,false,function(){
				callback(null,conflict?-1:1);
			});
		});
		reader.emit('data');
	}
}
function Sync(oldFile, newFile, options){
	var op=Object.assign({
		outputFile:null,
		force:false,
		stream:false
	},options||{});
	var source='';
	var patch;
	if(typeof oldFile=="string"){
		source=fs.readFileSync(oldFile,{encoding:'utf8'});
		patch=diff.structuredPatch('A','B',source,fs.readFileSync(newFile,{encoding:'utf8'}),'','');
	}else{//readstream
		source=readStreamSync(oldFile);
		var dest=readStreamSync(newFile);
		patch=diff.structuredPatch('A','B',source,dest,'','');
	}
	if(patch.hunks.length==0)
		return op.stream?null:0;
	else{
		source=source.split('\n');
		var lastSymbol=null;
		var hunkPending=Boolean(patch.hunks[0].oldStart>1);
		var pendingRemoves=[];
		var pendingAdditions=[];
		var conflict = false;
		var writer;
		if(op.stream){
			writer=new NodeStream.Readable();
		}else{
			writer=fs.createWriteStream(op.outputFile || newFile);
		}
		var writePendings=function(normalLine,addToPendingRemoves,last){
			var strToBeWritten=[];
			if(hunkPending){
				hunkPending=false;
				var preArr;
				if(hunkIndex==0){
					preArr=source.slice(0,patch.hunks[hunkIndex].oldStart-1);
				}else if(hunkIndex<patch.hunks.length){
					preArr=source.slice(patch.hunks[hunkIndex-1].oldStart+patch.hunks[hunkIndex-1].oldLines-1,patch.hunks[hunkIndex].oldStart-1);
				}else{//lastHunk
					preArr=source.slice(patch.hunks[hunkIndex-1].oldStart+patch.hunks[hunkIndex-1].oldLines-1);
				}
				if(preArr.length)
					strToBeWritten.push(preArr.join('\n'));
			}
			if(!pendingRemoves.length && pendingAdditions.length){//only addition
				strToBeWritten.push(pendingAdditions.join('\n'));
			}else if(pendingRemoves.length && pendingAdditions.length){//conflict
				conflict=true;
				if(options.force){//prefer additions
					strToBeWritten.push(pendingAdditions.join('\n'));
				}else{
					strToBeWritten.push(`<<<<<<< HEAD\n${pendingRemoves.join('\n')}\n=======\n${pendingAdditions.join('\n')}\n>>>>>>> New-HEAD`);
				}
			}
			if(normalLine)
				strToBeWritten.push(normalLine.substr(1));
			var writeFinishCallback=function(err){
				pendingRemoves=[];
				pendingAdditions=[];
				if(addToPendingRemoves) pendingRemoves.push(addToPendingRemoves);
			};
			if(!strToBeWritten.length)
				writeFinishCallback(null);
			else{
				if(op.stream){
					writer.push(strToBeWritten.join('\n')+(last?'':'\n'));
					writeFinishCallback();
				}else
					writer.write(strToBeWritten.join('\n')+(last?'':'\n'),writeFinishCallback);
			}
		}
		for(var hunkIndex=0;hunkIndex<patch.hunks.length;hunkIndex++){
			for(var hunkLineIndex=0;hunkLineIndex<patch.hunks[hunkIndex].lines.length;hunkLineIndex++){
				var line=patch.hunks[hunkIndex].lines[hunkLineIndex];
				if(line[0]==' '){
					writePendings(line);
					lastSymbol=null;
				}else if(line[0]=='-'){
					if(!lastSymbol || lastSymbol=='-'){//was normal or same
						pendingRemoves.push(line.substr(1));
						lastSymbol='-';
					}else{//was +
						lastSymbol='-';
						writePendings(false,line.substr(1));
					}
				}else if(line[0]=='+'){
					pendingAdditions.push(line.substr(1));
					lastSymbol='+';
				}else{//skip \ No newline at end of file
					if(lastSymbol){
						lastSymbol=null;
						writePendings();
					}
				}
			}
			hunkPending=true;
		}
		writePendings(false,false,true);
		if(op.stream){
			writer.push(null);
			return writer;
		}else
			return conflict?-1:1;
	}
}
module.exports=Async;
module.exports.Sync=Sync;