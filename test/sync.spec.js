var smf=require('../');
var fs=require('fs');

var old_file=__dirname+"/file_old.txt";
var new_file=__dirname+"/file_new.txt";
var output_file=__dirname+"/file_output.txt";
if(!fs.existsSync(old_file))
fs.writeFileSync(old_file,'line1\nline2\nline3\nline4\n');
if(!fs.existsSync(new_file))
fs.writeFileSync(new_file,'line1\nline2\nline 3\nline4\n');

var stream=smf.Sync(fs.createReadStream(old_file),fs.createReadStream(new_file),{stream:true});
if(stream){
    if(fs.existsSync(output_file)) fs.unlinkSync(output_file);
    var output=fs.createWriteStream(output_file);
    stream.pipe(output);
}else console.log(stream);

//smf(old_file,new_file,{outputFile:output_file},function(err,change){console.log(change);})
