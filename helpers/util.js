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

util.writeConfig = (assetName, path) => sh`
    #Edit ${path ? `${path}/` : ""}${assetName} and put assets/${assetName} inside
`;

util.hereWrite = (assetName, path, content) => sh `
    cat <<EOF | sudo tee ${path}/${assetName}
    ${content}
    EOF
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

util.createUser = (name, config = {}) => sh`
    adduser --gecos "" ${config.noLogin ? "--disabled-login " : ""} ${name}
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

util.addRepo = ({ host, repoPath = "", keyName, repoName }) => sh`
    curl -sS ${host}/${keyName} | apt-key add -
    DISTRO="$(lsb_release -s -c)"
    echo "deb ${host}/${repoPath} $DISTRO main" | tee /etc/apt/sources.list.d/${repoName}.list
    apt update
`;

util.makeExecutable = script => sh`
    chmod +x ${script}
`;

util.camelToDash = name =>
    name.split('').reduce((out, char) => {
        const lowerChar = char.toLowerCase();
        const isUpper = char != lowerChar;

        return `${out}${isUpper ? '-' : ""}${lowerChar}`;
    }, "");

util.fromEntries = entries =>
    [...entries].reduce((obj, [key, val]) => {
        obj[key] = val;
        return obj;
}, {});




module.exports = util;
