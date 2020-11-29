const
    { sh, gitClone, restart } = require("./util");

const postgres = {};

const serviceName = "postgresql";

postgres.createUser = (user, options) =>
    postgres.runCommand(`CREATE USER ${user} CREATEDB;`, options);

postgres.runCommand = (command, { host, user, pass, db, localUser }) => {
    const passEnvPrefix = !!pass ? `PGPASSWORD=${pass} ` : '';
    const hostOption = !!host ? `-h ${host} ` : '';
    const userOption = !!user ? `-u ${user} ` : '';
    const localUserCommand = !!localUser ? `sudo -u ${postgres} ` : '';

    return sh`
        ${passEnvPrefix}${localUserCommand}psql ${hostOption}${userOption}${db} -c '${command}'
    `;
}

postgres.tune = () => {
    const configPath = `/etc/${serviceName}/9.6/main/${serviceName}.conf`;
    return sh`
        ${restart(serviceName)}
    `;
};

module.exports = postgres;
