const fs = require('fs');
const { execSync } = require('child_process');

module.exports = {
    /**
     * simplistic CSV reader
     * @param {} pagesCSVFname
     */
    readCSV: function (pagesCSVFname) {
        let lines = this.readScript(pagesCSVFname);
        let header = [];
        let rows = [];
        for (const i in lines) {
            let line = lines[i];
            let cols = line.split(',');
            if (i == 0) {
                header = cols;
                continue;
            }
            let row = {};
            for (const i in header) {
                row[header[i]] = cols[i];
            }
            rows.push(row);
        }
        return rows;
    },

    // reads a file removing all comments (#) and blank lines
    // and converts each line to a regexp
    readRegExp: function (fname) {
        let lines = this.readScript(fname);
        let rows = [];
        for (const line of lines) {
            let regexp = new RegExp(line, 'i');
            rows.push(regexp);
        }
        return rows;
    },

    /**
     *  reads a file removing all comments (#) and blank lines
     *  (trims all whitespace)
     */
    readScript: function (fname) {
        let lines = this.readList(fname);
        let rows = [];
        for (let line of lines) {
            let pound = line.indexOf('#');
            if (pound > -1) line = line.substring(0, pound);
            line = line.trim();
            if (line.length === 0) continue;
            rows.push(line);
        }
        return rows;
    },

    /**
     * read a text file as an array of strings
     * (preserves whitespace)
     */
    readList: function (fname) {
        let text = this.read(fname);
        let textByLine = text.split('\n');
        return textByLine;
    },

    /**
     * read a text file as one long string
     */
    read: function (fname) {
        let text = "";
        try {
            text = fs.readFileSync(fname).toString('utf-8');
        } catch (ex) {
            // do nothing
        }
        return text;
    },

    /**
     * read all the filenames and directory-names (including . and ..)
     */
    readDir: function (dirname, theFilter = (fname => fname[0] !== '.')) {
        return fs.readdirSync(dirname).filter(theFilter);
    },

    /**
     * read a text file as a JSON object
     */
    readJSON: function (fname) {
        let text = this.read(fname);
        let json = JSON.parse(text);
        return json;
    },
    /**
     * read a text file as a JSONC (JSON w/ comments) object
     * WARNING: Doesn't like http://urls.... (because of //)
     */
    readJSONC: function (fname) {
        let lines = this.readList(fname);
        for (let i = 0; i < lines.length; i++) {
            let jsonLine = lines[i];
            let index;
            for (index = jsonLine.indexOf('//');
                index > -1;
                index = jsonLine.indexOf('//', index + 1)) {
                let proto = jsonLine.indexOf('://', index - 1);
                if (proto === index - 1) {
                    continue;
                } else {
                    jsonLine = jsonLine.substring(0, index);
                    break;
                }
            }
            lines[i] = jsonLine;
        }
        let result = lines.join('\n');
        let json = JSON.parse(result || '{}');
        return json;
    },
    /**
     * write an array of strings to a text file
     */
    writeList: function (fname, list) {
        this.write(fname, list.join('\n'));
    },

    /**
     * write a string directly to a text file
     * create the fully-qualified directory if it doesn't exist
     */
    write: function (fname, str) {
        let lastSlash = fname.lastIndexOf('/');
        if (lastSlash > -1) {
            dirname = fname.substring(0, lastSlash);
            this.createDir(dirname);
        }
        let buffer = new Buffer.from(str);
        let fd = fs.openSync(fname, 'w');
        fs.writeSync(fd, buffer, 0, buffer.length, null);
        fs.closeSync(fd);
    },
    /**
      * create an empty file and all associated directories
      */
    create: function (fname) {
        this.write(fname, '');
    },

    /**
     * recursively create all associated directories
     */
    createDir: function (dirname) {
        if (!fs.existsSync(dirname)) {
            fs.mkdirSync(dirname, { recursive: true }, err => {
                if (err) throw err;
            });
        }
    },

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

}
