const
    fs = require("fs"),
    { getRoot, sh, install, restart, writeConfig, hereWrite } = require("./util"),
    { compile, setup, reload, rule, inputRule, inputTcpRule, outputRule, forwardRule, accept, reject, log } = require("./iptables"),
    sshConfig = require("ssh-config");

const firewallRules = compile({
    filter: [
        //Allow all loopback (lo0) traffic and drop all traffic to 127/8 that doesn't use lo0
        inputRule({
            interface: "lo",
            target: accept
        }),
        inputRule({
            important: true,
            interface: "lo",
            destination: "127.0.0.0/8",
            target: reject,
        }),

        //Accept all established inbound connections
        inputRule({
            state: ["ESTABLISHED", "RELATED"],
            target: accept
        }),

        //Allow all outbound traffic - you can modify this to only allow certain traffic
        outputRule({
            target: accept
        }),

        //Allow certain inbound connections from anywhere
        inputTcpRule({
            destinationPort: 80,
            target: accept
        }),
        inputTcpRule({
            destinationPort: 443,
            target: accept
        }),
        inputTcpRule({
            destinationPort: 9100,
            target: accept
        }),

        //Allow SSH connections
        inputTcpRule({
            destinationPort: 22,
            state: "NEW",
            target: accept
        }),

        //Allow ping
        inputRule({
            protocol: "icmp",
            match: "icmp",
            icmpType: 8,
            target: accept
        }),

        //Log iptables denied calls
        inputRule({
            limit: "5/min",
            target: log,
            log: {
                prefix: "iptables denied: ",
                level: 7
            }
        }),

        //Reject all other inbound - default deny unless explicitly allowed policy
        inputRule({
            target: reject
        }),
        forwardRule({
            target: reject
        })
    ]
});

const setupFirewall = (rules, file) => {
    const configPath = "/etc/iptables";

    return sh`
        ${setup()}

        ${hereWrite(file, configPath, rules)}

        ${reload(file)}
    `;
};

const configureFail2Ban = () => {
    const jailLocal = fs.readFileSync(`${__dirname}/assets/jail.local`, "UTF-8");

    return sh`
        #fail2ban
        ${install("fail2ban", { assumeYes: true })}
        ${hereWrite("jail.local", "/etc/fail2ban", jailLocal)}
        ${restart("fail2ban")}
    `;
}

module.exports = sh`
    ${getRoot}

    #Edit /etc/ssh/sshd_config and find PasswordAuthentication. Make sure it’s uncommented and set to no. If you made any changes, restart sshd
    ${restart("ssh")}

    #update packages
    apt update && apt upgrade -y

    ${configureFail2Ban()}

    #firewall
    ${setupFirewall(firewallRules, "rules.v4")}
`;
