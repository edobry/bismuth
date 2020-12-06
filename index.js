const
    yargs = require('yargs/yargs'),
    { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv))
    .config()
    .usage("a seed crystal for clouds")
    .commandDir('apps/mastodon', {
        recurse: true
    })
    .demandCommand()
    .argv;
