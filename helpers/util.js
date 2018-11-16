const util = {};

util.stamper = (...transformers) => {
    const {
        subprocessors,
        endprocessors
    } = transformers.reduce((agg, { onSubstitution, onEndResult }) => {
        if(onSubstitution)
            agg.subprocessors.push(onSubstitution);
        if(onEndResult)
            agg.endprocessors.push(onEndResult);

        return agg;
    }, {
        subprocessors: [],
        endprocessors: []
    });

    return (strings, ...subs) => {
        const result = subs
            .map((sub, i) => [strings[i + 1], sub])
            .reduce(
                (soFar, [nextString, sub]) =>
                    soFar +
                    subprocessors.reduce((sub, processor) =>
                        processor(soFar, sub), sub) +
                    nextString,
                strings[0]);

        return endprocessors.reduce((end, processor) =>
            processor(end), result);
    };
};

const sh = util.sh = util.stamper(
    stripOuterEmptyLines,
    multilineSubstitutions,
    undent
);

util.wrapSingle = val =>
    !Array.isArray(val) ? [val] : val;

util.install = (packages, config = {}) => sh`
    apt install ${config.assumeYes ? "-y " : ""}${util.wrapSingle(packages).join(" ")}
`;

util.restart = service => sh`
    systemctl restart ${service}
`;

util.writeConfig = (path, assetName) => sh`
    #Edit ${path}/${assetName} and put assets/${assetName} inside
`;

util.getRoot = sh`
    sudo -i
`;

util.switchUser = user => sh`
    su - ${user}
`;

util.addToBashrc = line => sh`
    echo '${line}' >> ~/.bashrc
`;

util.gitClone = (source, target) => sh`
    git clone ${source} ${target}
`;

module.exports = util;
