var safeMergeFiles = require('../');
var fs = require('fs');
var assert= require('assert');

var tempfile1=__dirname+'/temp_old.txt';
var tempfile2=__dirname+'/temp_new.txt';
var tempfile3=__dirname+'/temp_output.txt';
describe('small file tests',function(){
	describe('similar test', function() {
		var result;
		before(function(done){
			fs.writeFileSync(tempfile1,'line 1\nline 2\nline 3');
			fs.writeFileSync(tempfile2,'line 1\nline 2\nline 3');
			safeMergeFiles(tempfile1,tempfile2,function(err,change){
				result=change;
				done();
			});
		});
		it('should be equal ',function(){
			assert.equal(fs.readFileSync(tempfile2,'utf8'),fs.readFileSync(tempfile1,'utf8'));
		});
		it('change should be 0',function(){
			assert.equal(result,0)
		});
	});
	describe('addition test', function() {
		var result;
		before(function(done){
			fs.writeFileSync(tempfile1,'line 1\nline 2\nline 3');
			fs.writeFileSync(tempfile2,'line 1\nline 2\nline 2.1\nline 3');
			safeMergeFiles(tempfile1,tempfile2,function(err,change){
				result=change;
				done();
			});
		});
		it('length should be more than old',function(){
			assert.equal(fs.readFileSync(tempfile2,'utf8').length>fs.readFileSync(tempfile1,'utf8').length,true);
		});
		it('change should be 1',function(){
			assert.equal(result,1);
		});
	});
	describe('deletion test', function() {
		var result;
		before(function(done){
			fs.writeFileSync(tempfile1,'line 1\nline 2\nline 3');
			fs.writeFileSync(tempfile2,'line 1\nline 3');
			safeMergeFiles(tempfile1,tempfile2,function(err,change){
				result=change;
				done();
			});
		});
		it('length should be less than old',function(){
			assert.equal(fs.readFileSync(tempfile2,'utf8').length<fs.readFileSync(tempfile1,'utf8').length,true);
		});
		it('change should be 1',function(){
			assert.equal(result,1);
		});
	});
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
			assert.equal(fs.readFileSync(tempfile2,'utf8'),'line 2\nline 3\nline 4\nline 5\n');
		});
		it('change should be 1',function(){
			assert.equal(result,1);
		});
	});
	describe('conflict test', function() {
		var result;
		before(function(done){
			fs.writeFileSync(tempfile1,'line 1\nline 2\nline 3');
			fs.writeFileSync(tempfile2,'line 1\nline2\nline 3');
			safeMergeFiles(tempfile1,tempfile2,function(err,change){
				result=change;
				done();
			});
		});
		it('should match the conflicted result',function(){
			assert.equal(fs.readFileSync(tempfile2,'utf8'),'line 1\n<<<<<<< HEAD\nline 2\n=======\nline2\n>>>>>>> New-HEAD\nline 3\n');
		});
		it('change should be -1',function(){
			assert.equal(result,-1);
		});
	});
	describe('force test', function() {
		var result;
		before(function(done){
			fs.writeFileSync(tempfile1,'line 1\nline 2\nline 3\n');
			fs.writeFileSync(tempfile2,'line 1\nline2\nline 3\n');
			safeMergeFiles(tempfile1,tempfile2,{force:true},function(err,change){
				result=change;
				done();
			});
		});
		it('should match the conflicted result with new file',function(){
			assert.equal(fs.readFileSync(tempfile2,'utf8'),'line 1\nline2\nline 3\n');
		});
		it('change should be -1',function(){
			assert.equal(result,-1);
		});
	});
	describe('output file test', function() {
		beforeEach(function(done){
			fs.writeFileSync(tempfile1,'line 1\nline 2\nline 3\n');
			fs.writeFileSync(tempfile2,'line 1\nline2\nline 3\n');
			safeMergeFiles(tempfile1,tempfile2,{outputFile:tempfile3},function(err){
				done();
			});
		});
		it('should not harm new file',function(){
			assert.equal(fs.readFileSync(tempfile2,'utf8'),'line 1\nline2\nline 3\n');
		});
		it('should have new output file with result',function(){
			assert.equal(fs.readFileSync(tempfile3,'utf8'),'line 1\n<<<<<<< HEAD\nline 2\n=======\nline2\n>>>>>>> New-HEAD\nline 3\n');
		});
		after(function(){
			fs.unlinkSync(tempfile3);
		})
	});
	after(function(){
		fs.unlinkSync(tempfile1);
		fs.unlinkSync(tempfile2);
	});
})