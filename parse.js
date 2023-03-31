const fs = require('fs');
const he = require('he');
const moment = require('moment');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 <file> <likes>')
    .demandCommand(2, 'Please provide a filename and minimum likes')
    .argv;

// Read the file
global.window = { YTD: { tweet: { part0: [] } }};
const fileContent = fs.readFileSync(argv._[0]).toString();
eval(fileContent);

// Print tweets with more than X likes
const tweets = window.YTD.tweet.part0;
let count = 0;
tweets.forEach(tweet => {
    if (parseInt(tweet.tweet.favorite_count) > parseInt(argv._[1])) {
        if (! tweet.tweet.in_reply_to_screen_name) {
            let full_text = he.decode(tweet.tweet.full_text);
            for (let url in tweet.tweet.entities.urls) {
                full_text = full_text.replace(tweet.tweet.entities.urls[url].url, tweet.tweet.entities.urls[url].expanded_url);
            }
            let words = full_text.toLowerCase().replace(/[^a-zA-Z0-9']+/g, ' ').trim().split(' ');
            let filename = "tweets/" + words.slice(0, 8).join(' ') + '.md';
            let date = moment(tweet.tweet.created_at, 'ddd MMM DD HH:mm:ss Z YYYY').format('YYYY-MM-DD');
            let content = `\
> ${full_text.replace(/\n/g, '\n> ')}

[@finereli](http://twitter.com/finereli) on ${date}

https://twitter.com/finereli/status/${tweet.tweet.id_str}`;
            fs.writeFileSync(filename, content);
            count++;
        }
    }
});

console.log(count);
