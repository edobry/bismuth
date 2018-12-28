const { sh } = require("./util");

const docker = {};

docker.createVolume = name => sh`
    docker volume create ${name}
    docker volume inspect ${name}
`;

module.exports = docker;
