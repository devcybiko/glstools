let aws = require('../glsaws/glsaws-index.js');
let polly = aws.polly;

async function main$() {
    aws.setCredentials('devcybiko-polly');
    let config = polly.getConfig();
    config.newsBoolean = false;
    config.rate = "115%";
    config.beforeBreakTime = "1s";
    config.afterBreakTime = "1s";
    let ssml = polly.toSSML("The band continued to tour, with Eddie Rothe replacing Adamson on drums, and during that period was considered to be one of the most popular 1960s bands on the UK concert circuit. In turn, in 2010 Eddie Rothe left The Searchers after becoming engaged to singer Jane McDonald, and was replaced on 26 February by Scott Ottaway., And now here's The Searchers, with their hit song, Needles and Pins, I'm Tylor Jones and this is Brandermill Local Radio.");
    console.log(ssml);
    polly.speakSSML$("a.mp3", ssml);
}

main$();