var safeMergeFiles = require('..');
var fs = require('fs');
var assert= require('assert');

var tempfile1=__dirname+'/temp_old.txt';
var tempfile2=__dirname+'/temp_new.txt';
describe('addition and deletion with and without conflict test', function() {
    describe('addition and deletion without conflict test', function() {
        var result;
        before(function(done){
            fs.writeFileSync(tempfile1,'line 1\nline 2\nline 3\nline 4\n');
            fs.writeFileSync(tempfile2,'line 2\nline 3\nline 4\nline 5\n');
            safeMergeFiles(tempfile1,tempfile2,function(err,change){
                result=change;
                done();
            });
        });
        it('should not have conflict',function(){
            assert.strictEqual(fs.readFileSync(tempfile2,'utf8'),'line 2\nline 3\nline 4\nline 5\n');
        });
        it('change should be 1',function(){
            assert.strictEqual(result,1);
        });
    });
    describe('addition and deletion with conflict test', function() {
        var result;
        before(function(done){
            fs.writeFileSync(tempfile1,'line 1\nline 2\nline 3\nline 4');
            fs.writeFileSync(tempfile2,'line 2\nline 3\nline 4\nline 5');
            safeMergeFiles(tempfile1,tempfile2,function(err,change){
                result=change;
                done();
            });
        });
        it('should have conflict',function(){
            assert.notStrictEqual(fs.readFileSync(tempfile2,'utf8'),'line 2\nline 3\nline 4\nline 5\n');
        });
        it('change should be -1',function(){
            assert.strictEqual(result,-1);
        });
    });
    after(function(){
        fs.unlinkSync(tempfile1);
        fs.unlinkSync(tempfile2);
    });
});
