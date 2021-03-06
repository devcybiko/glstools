const AWS = require('aws-sdk')

function setCredentials(credentials) {
    if (typeof credentials === "string") AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: credentials });
    else if (typeof credentials === "object" && credentials.profile) AWS.config.credentials = new AWS.SharedIniFileCredentials({ credentials });
    else throw "unknown credentials - supply a string or object {profile:'string'}";
    return AWS;
}

function setCredentials(profile) {
    AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: profile });
    return AWS;
}

module.exports = {AWS, setCredentials};