const
    { sh, install, enable, reload, restart, start, writeConfig, getRoot, switchUser, gitClone, unpack }
        = require("../../../helpers/util");

const targetVersion = "0.16.0";
const githubReleaseUrl = (repo, version, assetName) =>
    `https://github.com/${repo}/releases/download/v${version}/${assetName}`;

const nodeExporterFormat = version => `node_exporter-${version}.linux-amd64`

const assetName = nodeExporterFormat(targetVersion);

const archiveName = `${assetName}.tar.gz`;

const nodeExporterUrl = version =>
    githubReleaseUrl("prometheus/node_exporter", version, archiveName)

const binName = "node_exporter";

console.log(sh`
    cd /tmp
    curl -s -L -O -J ${nodeExporterUrl(targetVersion)}

    ${unpack(archiveName)}
    sudo cp ${assetName}/${binName} /usr/local/bin
    sudo chown ubuntu:ubuntu /usr/local/bin/${binName}

    ${writeConfig(`${binName}.service`, "/etc/systemd/system")}
    sudo ${reload}
    sudo ${start(binName)}
    sudo ${enable(binName)}
`);
