const
    { sh, install, restart, start, writeConfig, getRoot, createUser, switchUser, gitClone } = require("../../helpers/util"),
    ruby = require("../../helpers/ruby"),
    node = require("../../helpers/node"),
    postgres = require("../../helpers/postgres"),
    harden = require("../../helpers/harden.js");

const npmDeps = ["mucks", "phile"];

const appUser = "website";
const appDir = "dobry-me";
const appPath = `/home/${appUser}/${appDir}`;

const appRepo = "https://github.com/edobry/dobry.me.git";

console.log(sh`
    ${harden}

    ${getRoot}
    ${install("curl", { assumeYes: true })}
    ${node.install("11")}
    ${node.npmInstall(npmDeps, true)}

    ${createUser(appUser, { noLogin: true })}
    ${switchUser(appUser)}

    ${gitClone(appRepo, appDir)}
    
`);
