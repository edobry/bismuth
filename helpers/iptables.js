const { sh, makeExecutable, writeConfig, install } = require("./util");

const configPath = "/etc/iptables";

const iptables = {};

iptables.input = "INPUT";
iptables.output = "OUTPUT";
iptables.forward = "FORWARD";
iptables.accept = "ACCEPT";
iptables.reject = "REJECT";
iptables.log = "LOG";

iptables.setup = () => sh`
    ${install("iptables-persistent", { assumeYes: true })}
    ${writeConfig(rulesFile, configPath)}
`;

const
    boolean = key => (name, value) => key || name,
    basic = key => (name, value) => `-${(key || name)[0]} ${value}`,
    extended = key => (name, value) => `--${key || name} ${value}`;

const camelToDash = name =>
    name.split('').reduce((out, char) => {
        const lowerChar = char.toLowerCase();
        const isUpper = char != lowerChar;

        return `${out}${isUpper ? '-' : ""}${lowerChar}`;
    }, "");

const optionSerializers = {
    interface: {
        type: basic
    },
    target: {
        type: basic,
        key: 'j'
    },
    destination: {
        type: basic
    },
    match: {
        type: basic
    },
    state: {
        type: extended
    },
    protocol: {
        type: basic
    },
    destinationPort: {
        type: extended,
        key: "dport"
    },
    icmpType: {
        type: extended
    },
    limit: {
        type: extended
    },
    important: {
        type: boolean,
        key: '!'
    }
};

const optionConstrucor = args => {
    const params = args
}

const compileOptions = options =>
    Object.entries(options).map(([key, value]) => {
        const definedOption = optionSerializers[key];
        return (definedOption
            ? definedOption.type(definedOption.key)
            : extended())(key, value)
    }).join(' ');

iptables.rule = (chain, options) => sh`
    -A ${chain} ${compileOptions(options)}
`;

iptables.inputRule = options =>
    iptables.rule(iptables.input, options);

iptables.inputTcpRule = options =>
    iptables.inputRule({
        protocol: "tcp",
        ...options
    });

iptables.outputRule = (...args) =>
    iptables.rule(iptables.output, ...args);

iptables.forwardRule = (...args) =>
    iptables.rule(iptables.forward, ...args);

iptables.compile = tables => {
    return Object.entries(tables).map(([table, rules]) => sh`
        *${table}

        ${rules.join('\n')}

        COMMIT
    `);
};

iptables.configureFirewall = tables => {
    const compiledRules = iptables.compile(tables);

    console.log(compiledRules);

    return sh`
        ${iptables.reload("")}
    `;
};

iptables.reload = rulesFile => sh`
    iptables-restore < ${configPath}/${rulesFile}
`;

module.exports = iptables;
