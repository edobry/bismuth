const
    { sh, install, restart, start, writeConfig, getRoot, switchUser, gitClone, addGroup, addUserToGroup }
        = require("../../helpers/util");

const prereqs = [
    "apt-transport-https",
    "ca-certificates",
    "curl",
    "software-properties-common"];

const addRepo = (url, keyName, repoName) => sh`
    curl -fsSL ${url}/${keyName} | sudo apt-key add -
    sudo add-apt-repository "deb [arch=amd64] url $(lsb_release -cs) stable"
    sudo apt update
`;

const user = "ubuntu";

const groupName = "docker";

console.log(sh`
    ${install(prereqs)}
    ${addRepo("https://download.docker.com/linux/ubuntu", "gpg", "prometheus")}
    ${install("docker-ce")}

    ${addGroup(groupName)}
    ${addUserToGroup(groupName, user)}
`);
