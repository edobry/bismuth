const
    fs = require("fs"),
    { sh, install, reload, restart, start, writeConfig, hereWrite, getRoot, createUser, switchUser, gitClone } = require("../../helpers/util"),
    setup = require("../../helpers/setup.js"),
    harden = require("../../helpers/harden.js");

const deps = ["kubelet", "kubeadm", "kubectl"];

const kubeListName = "kubernetes.list";
const kubeList = fs.readFileSync(`assets/${kubeListName}`);

const installKubeadm = sh`
    curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -

    ${hereWrite(kubeListName, "/etc/apt/sources.list.d/", kubeList)}

    sudo apt update
    ${install(deps, { assumeYes: true })}
    sudo apt-mark hold ${deps.join(" ")}

    ${reload}
    ${restart("kubelet")}
`;

console.log(sh`
    ${setup}
    ${harden}

    ${installKubeadm}

    kubeadm config images pull
    kubeadm init --pod-network-cidr=10.217.0.0/16 --skip-phases=addon/kube-proxy

    kubectl create -f https://raw.githubusercontent.com/cilium/cilium/v1.6/install/kubernetes/quick-install.yaml
    kubectl get pods -n kube-system --selector=k8s-app=cilium

    kubectl taint nodes --all node-role.kubernetes.io/master-

    helm install cilium cilium/cilium --version 1.7.2 \
        --namespace kube-system \
        --set global.kubeProxyReplacement=strict \
        --set global.k8sServiceHost=192.168.1.18 \
        --set global.k8sServicePort=6443


    kubeadm join 192.168.1.18:6443 --token rq4zox.r6j37n87kd2w1n9j \
        --discovery-token-ca-cert-hash sha256:328d3c9f775f819bab5e3363fe3ffddd4dddb2de6f6c72a43b0e894d0732426a

`);
