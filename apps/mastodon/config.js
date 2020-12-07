const
    { sh, makeExecutable, writeConfig, install, camelToDash, fromEntries } = require("../../helpers/util"),
    merge = require("deepmerge");

module.exports = (domain, overrides = {}) => {
    const defaults = {
        federation: {
            domain,
            webDomain: "",
            alternateDomains: "",
            authorizedFetch: false,
            limitedFederationMode: false
        },
        redis: {
            host: "localhost",
            port: 6379
        },
        database: {
            endpoint: "/var/run/postgresql",
            username: "mastodon",
            name: "mastodon_production",
            password: "",
            port: 5432,
            pool: 100
        },
        search: {
            enabled: false,
            host: "localhost",
            port: 9200
        },
        secrets: {
            key_base: "",
            otp_secret: ""
        },
        push: {
            private_key: "",
            public_key: ""
        },
        mail: {
            server: "smtp.mailgun.org",
            port: 587,
            login: "",
            password: "",
            from_address: `notifications@${domain}`
        },
        file: {
            enabled: true,
            bucket: `files.${domain}`,
            accessKeyId: "",
            secretAccessKey: "",
            aliasHost: `files.${domain}`,
            protocol: "",
            hostname: "",
            endpoint: ""
        }
    };

    const { federation, redis, database, search, secrets, push, mail, file }
        = merge(defaults, overrides);

    return sh`
        # https://docs.joinmastodon.org/admin/config/

        # Federation
        # ----------
        # This identifies your server and cannot be changed safely later
        # ----------
        LOCAL_DOMAIN=${federation.domain}
        WEB_DOMAIN=${federation.webDomain}
        ALTERNATE_DOMAINS=${federation.alternateDomains}
        AUTHORIZED_FETCH=${federation.authorizedFetch}
        LIMITED_FEDERATION_MODE=${federation.limitedFederationMode}

        # Redis
        # -----
        REDIS_HOST=${redis.host}
        REDIS_PORT=${redis.port}

        # PostgreSQL
        # ----------
        DB_HOST=${database.endpoint}
        DB_USER=${database.username}
        DB_NAME=${database.name}
        DB_PASS=${database.password}
        DB_PORT=${database.port}
        DB_POOL=${database.pool}

        # ElasticSearch (optional)
        # ------------------------
        ES_ENABLED=${search.enabled}
        ES_HOST=${search.host}
        ES_PORT=${search.port}

        # Secrets
        # -------
        # Make sure to use \`rake secret\` to generate secrets
        # -------
        SECRET_KEY_BASE=${secrets.key_base}
        OTP_SECRET=${secrets.otp_secret}

        # Web Push
        # --------
        # Generate with \`rake mastodon:webpush:generate_vapid_key\`
        # --------
        VAPID_PRIVATE_KEY=${push.private_key}
        VAPID_PUBLIC_KEY=${push.public_key}

        # Sending mail
        # ------------
        SMTP_SERVER=${mail.server}
        SMTP_PORT=${mail.port}
        SMTP_LOGIN=${mail.login}
        SMTP_PASSWORD=${mail.password}
        SMTP_FROM_ADDRESS=${mail.from_address}

        # File storage (optional)
        # -----------------------
        S3_ENABLED=${file.enabled}
        S3_ALIAS_HOST=${file.aliasHost}
        S3_BUCKET=${file.bucket}
        AWS_ACCESS_KEY_ID=${file.accessKeyId}
        AWS_SECRET_ACCESS_KEY=${file.secretAccessKey}
        S3_REGION=${file.region}
        S3_PROTOCOL=${file.protocol}
        S3_HOSTNAME=${file.hostname}
        S3_ENDPOINT=${file.endpoint}
    `;
}
