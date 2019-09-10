const { sh, makeExecutable, writeConfig } = require("./util");

const configPath = "/etc/iptables";

const iptables = {};

iptables.input = "INPUT";
iptables.output = "OUTPUT";
iptables.forward = "FORWARD";
iptables.accept = "ACCEPT";
iptables.reject = "REJECT";
iptables.log = "LOG";

iptables.setup = sh`
    ${install("iptables-persistent", { assumeYes: true })}
    ${writeConfig(rulesFile, configPath)}
`;

iptables.rule = (chain, { , options }) => sh`

`;

iptables.inputRule = (...args) =>
    iptables.rule(iptables.input, ...args);

iptables.outputRule = (...args) =>
    iptables.rule(iptables.output, ...args);

iptables.forwardRule = (...args) =>
    iptables.rule(iptables.forward, ...args);

iptables.configureFirewall = rules => {


    return sh`
        ${iptables.reload()}
    `;
};

iptables.reload = rulesFile => sh`
    iptables-restore < ${configPath}/${rulesFile}
`;

module.exports = iptables;
