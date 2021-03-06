const
    genConfig = require("./config"),
    { sh, install, restart, start, hereWrite, getRoot, createUser, switchUser, gitClone } = require("../../helpers/util"),
    ruby = require("../../helpers/ruby"),
    node = require("../../helpers/node"),
    postgres = require("../../helpers/postgres"),
    harden = require("../../helpers/harden.js"),

    yargs = require('yargs/yargs'),
    { hideBin } = require('yargs/helpers');

const deps = [
    "imagemagick", "ffmpeg", "libpq-dev", "libxml2-dev", "libxslt1-dev", "file",
    "git-core", "g++", "libprotobuf-dev", "protobuf-compiler", "pkg-config",
    "nodejs", "gcc", "autoconf", "bison", "build-essential", "libssl-dev",
    "libyaml-dev", "libreadline6-dev", "zlib1g-dev", "libncurses5-dev",
    "libffi-dev", "libgdbm6", "libgdbm-dev", "nginx", "redis-server",
    "redis-tools", "certbot", "postgresql-client",
    "libidn11-dev", "libicu-dev", "libjemalloc-dev"];

const mastodonUser = "mastodon";
const mastoDir = "live";
const mastoPath = `/home/${mastodonUser}/${mastoDir}`;

const setupMasto = args => {
    const { domain, database, mail, file } = args;

    if(database.local) {
        deps.push("postgresql", "postgresql-contrib")
    }

    return sh`
        ${switchUser(mastodonUser)}
        ${gitClone("https://github.com/tootsuite/mastodon.git", mastoPath)} && cd ${mastoPath}
        #checkout highest numbered release tag
        git checkout $(git tag -l | grep -v 'rc[0-9]*$' | sort -V | tail -n 1)

        #install deps
        bundle install \
            -j$(getconf _NPROCESSORS_ONLN) \
            --deployment --without development test
        yarn install --pure-lockfile

        ${hereWrite(".env.production", mastoPath, genConfig(domain, args))}

        #setup wizard; is interactive?
        RAILS_ENV=production bundle exec rake mastodon:setup

        exit
    `;
};

const setupNginx = (mastoPath, domain) => {
    const nginxRoot = "/etc/nginx";
    const mastoConfigPath = `${nginxRoot}/sites-available/mastodon`;

    return sh`
        cp ${mastoPath}/dist/nginx.conf ${mastoConfigPath}
        ln -s ${mastoConfigPath} ${nginxRoot}/sites-enabled/mastodon

        #edit ${mastoConfigPath} to replace example.com with ${domain}
        sed -i 's/example\.com/${domain}/g' ${mastoConfigPath}

        ${restart("nginx")}

        #enable SSL
        certbot certonly --webroot -d ${domain} -w ${mastoPath}/public/
        #edit ${mastoConfigPath} to uncomment and adjust the ssl_certificate and ssl_certificate_key lines
        ${restart("nginx")}

        cp ${mastoPath}/dist/mastodon-*.service /etc/systemd/system/

        #edit config to check usernames and paths
        #/etc/systemd/system/mastodon-web.service
        #/etc/systemd/system/mastodon-sidekiq.service
        #/etc/systemd/system/mastodon-streaming.service

        ${start(["mastodon-web", "mastodon-sidekiq", "mastodon-streaming"])}
        systemctl enable mastodon-*
    `;
};

const handler = args => {
    const { domain, db } = args;

    const dbOptions = {
        host: db.endpoint,
        user: db.username,
        pass: db.password
    };

    console.log(sh`
        ${harden}

        ${getRoot}
        ${install("curl", { assumeYes: true })}
        ${node.install("15")}
        ${install(deps, { assumeYes: true })}

        ${createUser(mastodonUser, { noLogin: true })}
        ${switchUser(mastodonUser)}

        ${ruby.install("2.6.6")}
        exit

        #tune postgres w/ pgTune mb?
        ${postgres.createUser(mastodonUser, dbOptions)}

        #now for the actual masto setup
        ${setupMasto(args)}

        ${setupNginx(mastoPath, domain)}
    `);
};

module.exports = {
    command: "mastodon setup",
    desc: "generates a Mastodon setup script",
    builder: yargs => yargs
        .option('domain', {
            required: true,
            description: "domain name to use"
        })
        .option('database.endpoint', {
            alias: 'db.endpoint',
            description: "database to use [connection endpoint]",
            // required: true
        })
        .option('database.username', {
            alias: 'db.username',
            description: "database to use [username]",
            // required: true
        })
        .option('database.password', {
            alias: 'db.password',
            description: "database to use [password]",
            // required: true
        })
        .option('file.enabled', {
            description: "whether to use an object storage provider",
            implies: ["file.accessKey", "file.secretKey"]
        })
        .option('file.accessKey', {
            description: "object storage provider [access key ID]"
        })
        .option('file.secretKey', {
            description: "object storage provider [secret access key]"
        })
        .option('mail.server', {
            // required: true,
            description: "email sending provider to use"
        })
        .option('mail.login', {
            // required: true,
            description: "email sending provider to use"
        })
        .option('mail.password', {
            // required: true,
            description: "email sending provider to use"
        })
        .wrap(yargs.terminalWidth()),
    handler
};
