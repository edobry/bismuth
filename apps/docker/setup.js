const
    { sh, install, restart, enable, start, writeConfig, getRoot, switchUser, gitClone, addGroup, addUserToGroup }
        = require("../../helpers/util"),
    harden = require("../../helpers/harden");


const prereqs = [
    "apt-transport-https",
    "ca-certificates",
    "curl",
    "software-properties-common"];

const addRepo = ({ host, keyName, repoName }) => sh`
    curl -fsSL ${host}/${keyName} | sudo apt-key add -
    sudo add-apt-repository "deb [arch=amd64] ${host}/${repoName} $(lsb_release -cs) stable"
    sudo apt update
`;

const user = "ubuntu";

const groupName = "docker";

module.exports = sh`
    ${harden}

    ${install(prereqs)}
    ${addRepo({
        host: "https://download.docker.com/linux/ubuntu",
        keyName: "gpg",
    })}
    ${install("docker-ce")}

    #config perms
    ${addGroup(groupName)}
    ${addUserToGroup(groupName, user)}

    #configure run on boot
    ${enable("docker")}
`;
