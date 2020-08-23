let aws = require('../glsaws/glsaws-index.js');
let polly = aws.polly;

async function main$() {
    aws.setCredentials('devcybiko-polly');
    let text = "The band continued to tour, with Eddie Rothe replacing Adamson on drums, and during that period was considered to be one of the most popular 1960s bands on the UK concert circuit. In turn, in 2010 Eddie Rothe left The Searchers after becoming engaged to singer Jane McDonald, and was replaced on 26 February by Scott Ottaway., And now here's The Searchers, with their hit song, Needles and Pins, I'm Tylor Jones and this is Brandermill Local Radio.";
    
    console.log("first as alexa (joanna)");
    await polly.speak$("a.mp3", text);

    console.log("now as matthew, news broadcaster");
    polly.setConfig("Matthew,neural,115%,true");
    let ssml = polly.toSSML(text);

    await polly.speakSSML$("b.mp3", ssml);
    console.log("DONE");
}

main$();