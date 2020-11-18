const { sh, makeExecutable, writeConfig, install, camelToDash, fromEntries } = require("./util");

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
`;

const compileKey = (key, name) =>
    camelToDash(key || name);

const handleValue = val =>
    typeof val == "string" && val.includes(' ')
        ? `\"${val}\"`
        : val;

const nameMatcher = (paramName, name) =>
    paramName == name;

const paramTypes = {
    implies: {
        match: nameMatcher,
        handler: (paramKey, paramValue) =>
            compileOptions(paramValue)
    }
};

const handleParam = param =>
    Object.entries(paramTypes)
        .filter(([paramTypeKey, { match }]) =>
            match(paramTypeKey, ...param))
        .map(([, { handler }]) =>
            handler(...param));

const option = (keyMapper, valueMapper = handleValue) => (optionConfig = {}) => {
    const { key, ...params } = optionConfig;

    return (name, value) => [
        ...Object.entries(params)
            .map(handleParam),
        keyMapper(key, name),
        handleValue(value)
    ].join(' ');
};

const
    boolean = option(compileKey, () => ''),
    basic = option((key, name) => `-${(key || name)[0]}`),
    special = option((key, name) => key),
    extended = option((key, name) => `--${compileKey(key, name)}`),
    nested = () => (key, value) =>
        //prepend the key to each nested val and flatten
        compileOptions(fromEntries(
            Object.entries(value)
                .map(([nestedKey, nestedValue]) =>
                    [`${key}-${nestedKey}`, nestedValue])));

const optionSerializers = {
    interface: basic(),
    target: basic({
        key: 'j'
    }),
    destination: basic(),
    match: basic(),
    state: extended({
        implies: {
            match: "state"
        }
    }),
    protocol: basic(),
    destinationPort: extended({
        key: "dport"
    }),
    icmpType: extended(),
    limit: extended(),
    important: special({
        key: '!'
    })
};

const isObject = val =>
    typeof val === "object" &&
    !Array.isArray(val);

const compileOption = ([key, value]) => {
    //if the option is not defined or nested, treat it as extended
    const optionHandler = optionSerializers[key] || (
        isObject(value)
            ? nested
            : extended)();

    return optionHandler(key, value);
};

const compileOptions = options =>
    Object.entries(options)
        .map(compileOption).join(' ');

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
    `).join('\n');
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
