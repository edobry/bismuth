const { source } = require("./tags");

const util = {};

const sh = util.sh = source;

util.wrapSingle = val =>
    !Array.isArray(val) ? [val] : val;

util.install = (packages, config = {}) => sh`
    apt install ${config.assumeYes ? "-y " : ""}${util.wrapSingle(packages).join(" ")}
`;

util.reload = sh`
    systemctl daemon-reload
`;

util.restart = service => sh`
    systemctl restart ${service}
`;

util.enable = services => sh`
    systemctl enable ${util.wrapSingle(services).join(" ")}
`;

util.start = services => sh`
    systemctl start ${util.wrapSingle(services).join(" ")}
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

util.addGroup = group => sh`
    sudo groupadd ${group}
`;

util.addUserToGroup = (group, user) => sh`
    sudo usermod -aG ${group} ${user}
`;

util.addToBashrc = line => sh`
    echo '${line}' >> ~/.bashrc
`;

util.gitClone = (source, target) => sh`
    git clone ${source} ${target}
`;

util.resizePartition = (device, partition) => sh`
    growpart ${device} ${partition}
`;

util.unpack = path => sh`
    tar xvf ${path}
`;

util.addRepo = (url, keyName, repoName) => sh`
    curl -sS ${url}/${keyName} | apt-key add -
    echo "deb ${url} stable main" | tee /etc/apt/sources.list.d/${repoName}.list
    apt update
`;

module.exports = util;
