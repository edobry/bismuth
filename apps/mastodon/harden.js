const
    { sh, install, restart, writeConfig } = require("../helpers/util"),
    sshConfig = require("ssh-config");

const setupFirewall = rulesFile => {
    const configPath = "/etc/iptables";

    return sh`
        ${install("iptables-persistent", { assumeYes: true })}
        ${writeConfig(configPath, rulesFile)}
        #load config
        iptables-restore < ${configPath}/${rulesFile}
    `;
};

module.exports = sh`
    #Edit /etc/ssh/sshd_config and find PasswordAuthentication. Make sure it’s uncommented and set to no. If you made any changes, restart sshd
    ${restart("ssh")}

    #update packages
    apt update && apt upgrade -y

    #fail2ban
    ${install("fail2ban")}
    ${writeConfig("/etc/fail2ban", "jail.local")}
    ${restart("fail2ban")}
    ${writeConfig("/etc/fail2ban", "jail.local")}

    #firewall
    ${setupFirewall("rules.v4")}
`;
