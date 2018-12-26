const
    { sh, install, restart, start, writeConfig, getRoot, switchUser, gitClone, addRepo } = require("../../helpers/util");

const deps = [
    "prometheus",
    "prometheus-node-exporter",
    "prometheus-pushgateway",
    "prometheus-alertmanager"];

console.log(sh`
    ${addRepo("https://s3-eu-west-1.amazonaws.com/deb.robustperception.io", "41EFC99D.gpg", "prometheus")}
    ${install(deps)}
`);
