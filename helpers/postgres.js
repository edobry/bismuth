const
    { sh, gitClone, restart } = require("../helpers/util");

const postgres = {};

const serviceName = "postgresql";

postgres.createUser = user => sh`
    sudo -u postgres psql -c "CREATE USER ${user} CREATEDB;"
`;

postgres.tune = () => {
    const configPath = `/etc/${serviceName}/9.6/main/${serviceName}.conf`;
    return sh`
        ${restart(serviceName)}
    `;
};

module.exports = postgres;
