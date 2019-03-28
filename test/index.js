var safeMergeFiles = require('../');
var fs = require('fs');
var assert= require('assert');

var tempfile1=__dirname+'/temp_old.txt';
var tempfile2=__dirname+'/temp_new.txt';
var tempfile3=__dirname+'/temp_output.txt';
describe('small file tests',function(){
	describe('similar test', function() {
		beforeEach(function(){
			fs.writeFileSync(tempfile1,'line 1\nline 2\nline 3');
			fs.writeFileSync(tempfile2,'line 1\nline 2\nline 3');
		});
		it('should be equal ',function(done){
			safeMergeFiles(tempfile1,tempfile2,function(err,conflict){
				assert.equal(fs.readFileSync(tempfile2,'utf8'),fs.readFileSync(tempfile1,'utf8'));
				done();
			});
		});
	});
	describe('addition test', function() {
		beforeEach(function(){
			fs.writeFileSync(tempfile1,'line 1\nline 2\nline 3');
			fs.writeFileSync(tempfile2,'line 1\nline 2\nline 2.1\nline 3');
		});
		it('length should be more than old',function(done){
			safeMergeFiles(tempfile1,tempfile2,function(err,conflict){
				assert.equal(fs.readFileSync(tempfile2,'utf8').length>fs.readFileSync(tempfile1,'utf8').length,true);
				done();
			});
		});
	});
	describe('deletion test', function() {
		beforeEach(function(){
			fs.writeFileSync(tempfile1,'line 1\nline 2\nline 3');
			fs.writeFileSync(tempfile2,'line 1\nline 3');
		});
		it('length should be less than old',function(done){
			safeMergeFiles(tempfile1,tempfile2,function(err,conflict){
				assert.equal(fs.readFileSync(tempfile2,'utf8').length<fs.readFileSync(tempfile1,'utf8').length,true);
				done();
			});
		});
	});
	describe('addition and deletion without conflict test', function() {
		beforeEach(function(){
			fs.writeFileSync(tempfile1,'line 1\nline 2\nline 3\nline 4\n');
			fs.writeFileSync(tempfile2,'line 2\nline 3\nline 4\nline 5\n');
		});
		it('should not have conflict',function(done){
			safeMergeFiles(tempfile1,tempfile2,function(err,conflict){
				assert.equal(fs.readFileSync(tempfile2,'utf8'),'line 2\nline 3\nline 4\nline 5\n');
				done();
			});
		});
	});
	describe('conflict test', function() {
		beforeEach(function(){
			fs.writeFileSync(tempfile1,'line 1\nline 2\nline 3');
			fs.writeFileSync(tempfile2,'line 1\nline2\nline 3');
		});
		it('should match the conflicted result',function(done){
			safeMergeFiles(tempfile1,tempfile2,function(err,conflict){
				assert.equal(fs.readFileSync(tempfile2,'utf8'),'line 1\n<<<<<<< HEAD\nline 2\n=======\nline2\n>>>>>>> New-HEAD\nline 3\n');
				done();
			});
		});
	});
	describe('force test', function() {
		beforeEach(function(){
			fs.writeFileSync(tempfile1,'line 1\nline 2\nline 3\n');
			fs.writeFileSync(tempfile2,'line 1\nline2\nline 3\n');
		});
		it('should match the conflicted result with new file',function(done){
			safeMergeFiles(tempfile1,tempfile2,{force:true},function(err,conflict){
				assert.equal(fs.readFileSync(tempfile2,'utf8'),'line 1\nline2\nline 3\n');
				done();
			});
		});
	});
	describe('output file test', function() {
		beforeEach(function(done){
			fs.writeFileSync(tempfile1,'line 1\nline 2\nline 3\n');
			fs.writeFileSync(tempfile2,'line 1\nline2\nline 3\n');
			safeMergeFiles(tempfile1,tempfile2,{outputFile:tempfile3},function(err,conflict){
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