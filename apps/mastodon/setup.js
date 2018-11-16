const
    { sh, install, restart, writeConfig, getRoot, switchUser } = require("../helpers/util"),
    ruby = require("../helpers/ruby"),
    postgres = require("../helpers/postgres"),
    harden = require("../harden.js");

const installNode = version => sh`
    curl -sL https://deb.nodesource.com/setup_${version}.x | bash -
`;

const addRepo = (url, keyName, repoName) => sh`
    curl -sS ${url}/${keyName} | apt-key add -
    echo "deb ${url} stable main" | tee /etc/apt/sources.list.d/${repoName}.list
    apt update
`;

const createUser = (name, config = {}) => sh`
    adduser ${config.noLogin ? "--disabled-login " : ""}${name}
`;

const deps = [
    "imagemagick", "ffmpeg", "libpq-dev", "libxml2-dev", "libxslt1-dev", "file",
    "git-core", "g++", "libprotobuf-dev", "protobuf-compiler", "pkg-config",
    "nodejs", "gcc", "autoconf", "bison", "build-essential", "libssl-dev",
    "libyaml-dev", "libreadline6-dev", "zlib1g-dev", "libncurses5-dev",
    "libffi-dev", "libgdbm5", "libgdbm-dev", "nginx", "redis-server",
    "redis-tools", "postgresql", "postgresql-contrib", "certbot", "yarn",
    "libidn11-dev", "libicu-dev", "libjemalloc-dev"];

const mastodonUser = "mastodon";

module.exports = sh`
    ${harden}

    ${getRoot}
    ${install("curl", { assumeYes: true })}
    ${installNode("11")}
    ${addRepo("https://dl.yarnpkg.com/debian", "pubkey.gpg", "yarn")}
    ${install(deps, { assumeYes: true })}

    ${createUser(mastodonUser, { noLogin: true })}
    ${switchUser(mastodonUser)}

    ${ruby.install("2.5.3")}

    #tune postgres w/ pgTune mb?
    ${postgres.createUser("mastodon")}

    #now for the actual masto setup
`;
