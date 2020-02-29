var test = require('unit.js');
var files = require('../index').files;
var procs = require('../index').procs;

describe('testing gls.procs', function () {
    it('can create a folder and read it', function () {
        let testFile = `/tmp/glsfiles/testdir`;
        files.create(testFile);
        let dirs = files.readDir(`/tmp/glsfiles`);
        test.value(dirs).is([`testdir`]);
    });
    it('can run a command', function () {
        let cmd = `ls -a /tmp/glsfiles`;
        let result = procs.run(cmd);
        let expected = `.\n..\ntestdir\n`;
        test.value(result).is(expected);
    });
});