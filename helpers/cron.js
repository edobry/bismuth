const { sh, makeExecutable } = require("./util");

const cron = {};

cron.runHourly = script => sh`
    ${makeExecutable(script)}
    mv ${script} /etc/cron.hourly/.
`;

module.exports = cron;
