const
    { sh, addRepo, install, wrapSingle } = require("./util");

const node = {};

const repoName = "nodesource";
const nodesourceUrl = "https://deb.nodesource.com";
const nodesourceKey = "gpgkey/nodesource.gpg.key";

const nodeVersion = ver => `node_${ver}.x`;

node.install = version => sh`
    ${addRepo({
        host: nodesourceUrl,
        repoPath: nodeVersion(version),
        keyName: nodesourceKey,
        repoName
    })}
    ${addRepo({
        host: "https://dl.yarnpkg.com/debian",
        keyName: "pubkey.gpg",
        repoName: "yarn"
    })}
    ${install(["build-essential", "nodejs", "yarn"], { assumeYes: true })}
`;

node.npmInstall = (packages, global = false) => sh`
    npm install ${global ? "-g " : ""}${wrapSingle(packages).join(" ")}
`;

module.exports = node;
