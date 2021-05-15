const { execSync } = require('child_process');
const args = require('./glsargs.js');

module.exports = {
    /**
     * run the command and return the stdout
     * if there's an error, returns stderr
     */
    run: function (cmd) {
        let result = "Error..."
        try {
            result = execSync(cmd, { encoding: 'utf8' });
        } catch (e) {
            return e;
        }
        return result;
    },
    sleep$: async function (ms) { //note that the $ indicates it returns a promise - it's a$ynchronous
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    },
    die: function (msg, rc = 1) {
        console.error("\n" + msg + "\n");
        process.exit(rc);
    },
    args: args
}

