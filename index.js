var diff = require("diff");
var fs = require('fs');
var EE = require('events').EventEmitter;

module.exports=function(oldFile,newFile,options,callback){
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
		callback(null,true);
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
			var strToBeWritten='';
			if(hunkPending){
				hunkPending=false;
				if(hunkIndex==0){
					strToBeWritten+=source.slice(0,patch.hunks[hunkIndex].oldStart-1).join('\n');
				}else if(hunkIndex<patch.hunks.length){
					strToBeWritten+=source.slice(patch.hunks[hunkIndex-1].oldStart+patch.hunks[hunkIndex-1].oldLines-1,patch.hunks[hunkIndex].oldStart-1).join('\n');
				}else{//lastHunk
					strToBeWritten+=source.slice(patch.hunks[hunkIndex-1].oldStart+patch.hunks[hunkIndex-1].oldLines-1).join('\n');
				}
			}
			if(!pendingRemoves.length && pendingAdditions.length){//only addition
				strToBeWritten+=pendingAdditions.join('\n')+'\n';
			}else if(pendingRemoves.length && pendingAdditions.length){//conflict
				conflict=true;
				if(options.force){//prefer additions
					strToBeWritten+=pendingAdditions.join('\n')+'\n';
				}else{
					strToBeWritten+=`<<<<<<< HEAD\n${pendingRemoves.join('\n')}\n=======\n${pendingAdditions.join('\n')}\n>>>>>>> New-HEAD\n`;
				}
			}
			if(normalLine)
				strToBeWritten+=normalLine.substr(1)+'\n';
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
				writer.write(strToBeWritten,writeFinishCallback);
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
				callback(null,conflict);
			});
		});
		reader.emit('data');
	}
}
