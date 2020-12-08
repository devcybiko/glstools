const { execSync } = require('child_process');
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
    sleep$: async function(ms) { //note that the $ indicates it returns a promise - it's a$ynchronous
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    },

    args: function(optionString) {
        let options = optionString.split(",");
        let result = {};
        for(let i=2; i<process.argv.length; i++) {
            let arg = process.argv[i];
            let words = arg.split("=");
            let option = words[0];
            let value = words[1];
            if (options.includes(option)) {
                option = option.substring(1)
             } else {
                 value = option;
                 option = "files";
             }
            let list = result[option] || [];
            list.push(value);
            result[option] = list;
        }
        return result;
    }
}