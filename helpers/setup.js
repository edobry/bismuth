const
    { sh, install, restart, writeConfig } = require("./util"),
    { configureFirewall, rule, inputRule, inputTcpRule, outputRule, forwardRule, accept, reject, log } = require("./iptables"),
    sshConfig = require("ssh-config");

const deps = ["htop", "tmux", "iftop", "iotop", "net-tools", "curl",
    "apt-transport-https", "docker"];

const dockerDeps = ["gnupg-agent", "docker-ce", "docker-ce-cli", "containerd.io"];

const dockerDaemonName = "daemon.json";
const dockerDaemon = fs.readFileSync(`assets/${dockerDaemonName}`);

const installDocker = sh`
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
    sudo add-apt-repository \
        "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
        $(lsb_release -cs) \
        stable"

    apt update
    ${install(dockerDeps, { assumeYes: true })}

    ${hereWrite(dockerDaemonName, "/etc/docker/", dockerDaemon)}
    mkdir -p /etc/systemd/system/docker.service.d

    ${reload}
    ${restart("docker")}

    sudo docker run hello-world
`;

module.exports = sh`
    #update packages
    apt update && apt upgrade -y

    ${install(deps, { assumeYes: true })}

    mkdir /tmux

    #init tmux sessions
    tmux -S /tmux/mon
    tmux -S /tmux/edobry
`;
