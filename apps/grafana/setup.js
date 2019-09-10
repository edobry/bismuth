const
    { sh, install, restart, start, writeConfig, getRoot, switchUser, gitClone }
        = require("../../helpers/util"),
    docker = require("../../helpers/docker");

const deps = [
    "prometheus",
    "prometheus-node-exporter",
    "prometheus-pushgateway",
    "prometheus-alertmanager"];

const port = 3000;

const volumeName = "grafana-storage";

const configDir = "/etc/grafana";
const configFile = "grafana.ini";
const configPath = `${configDir}/${configFile}`;

//keep it at the default for now
const adminPass = "admin";

console.log(sh`
    sudo mkdir ${configDir}
    ${writeConfig(configDir, configFile)}

    ${docker.createVolume(volumeName)}

    docker run -p ${port}:${port} \
        --mount type=bind,source=${configPath},target=${configPath} \
        --mount type=volume,source=${volumeName},target=/var/lib/grafana \
        --restart=always
        --name grafana
        grafana/grafana
`);
