var safeMergeFiles = require('..');
var fs = require('fs');
var assert= require('assert');

var old_file=__dirname+"/file_old.txt";
var new_file=__dirname+"/file_new.txt";
var output_file=__dirname+"/file_output.txt";
describe('stream with conflict test', function() {
    var result;
    before(function(done){
        fs.writeFileSync(old_file,'line1\nline2\nline3\nline4\n');
        fs.writeFileSync(new_file,'line1\nline2\nline 3\nline4\n');

        var stream=safeMergeFiles.Sync(fs.createReadStream(old_file),fs.createReadStream(new_file),{stream:true});
        if(stream){
            if(fs.existsSync(output_file)) fs.unlinkSync(output_file);
            var output=fs.createWriteStream(output_file);
            stream.pipe(output);
            output.on('finish', done);
        }else{
            throw new Error('Did not return stream')
        }
    });
    it('should have conflict markers',function(){
        assert.strictEqual(fs.readFileSync(output_file,'utf8'),`line1\nline2\n<<<<<<< HEAD\nline3\n=======\nline 3\n>>>>>>> New-HEAD\nline4`);
    });
    after(function(){
        fs.unlinkSync(old_file);
        fs.unlinkSync(new_file);
        fs.unlinkSync(output_file);
    });
});