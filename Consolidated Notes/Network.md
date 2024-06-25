# Prerequsites

### Kubectl

On Linux:

```bash
# For AMD64 / x86_64
[ $(uname -m) = x86_64 ] &&  curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
# For ARM64
[ $(uname -m) = arm64 ] && curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/arm64/kubectl"

sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

kubectl version --client
```

### Kind 

On Linux:

``` bash
# For AMD64 / x86_64
[ $(uname -m) = x86_64 ] && curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-amd64
# For ARM64
[ $(uname -m) = aarch64 ] && curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.20.0/kind-linux-arm64
chmod +x ./kind
sudo mv ./kind /usr/local/bin/kind
kind --version
```

Note: You need to have the docker installed as prerequsite to create kind cluster

### HLF Plugin

On Linux:

``` bash
# For AMD64 / x86_64
[ $(uname -m) = x86_64 ] && curl -Lo /tmp/kubectl-hlf.zip https://github.com/hyperledger/bevel-operator-fabric/releases/download/v1.9.1/hlf-operator_v1.9.1_linux_amd64.zip
# For ARM64
[ $(uname -m) = aarch64 ] && curl -Lo /tmp/kubectl-hlf.zip https://github.com/hyperledger/bevel-operator-fabric/releases/download/v1.9.1/hlf-operator_v1.9.1_linux_arm64.zip

mkdir -p /tmp/kubectl-hlf
unzip /tmp/kubectl-hlf.zip -d /tmp/kubectl-hlf
chmod +x /tmp/kubectl-hlf/kubectl-hlf
sudo mv /tmp/kubectl-hlf/kubectl-hlf /usr/local/bin/kubectl-hlf
kubectl-hlf
```
# Cluster Setup

### Local setup - Kind Cluster

`kind` lets you run Kubernetes on your local computer. This tool requires that you have either `Docker` or `Podman` installed.

```bash
cat << EOF > kind-config.yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  image: kindest/node:v1.27.3
  extraPortMappings:
  - containerPort: 30949
    hostPort: 80
  - containerPort: 30950
    hostPort: 443
- role: worker
  image: kindest/node:v1.27.3
- role: worker
  image: kindest/node:v1.27.3
EOF
```
```bash
kind create cluster --config=./kind-config.yaml

```
### Istio CLI

```bash
curl -L https://istio.io/downloadIstio | sh -
```
```bash
cd <ISTIO_DIRECTORY> 
```
```bash
export PATH=$PWD/bin:$PATH 
kubectl create namespace istio-system 
istioctl operator init 
```
### Istio setup with loadbalancer
```bash
kubectl apply -f - <<EOF 

apiVersion: install.istio.io/v1alpha1 

kind: IstioOperator 

metadata: 

  name: istio-gateway 

  namespace: istio-system 

spec: 

  addonComponents: 

    grafana: 

      enabled: false 

    kiali: 

      enabled: false 

    prometheus: 

      enabled: false 

    tracing: 

      enabled: false 

  components: 

    ingressGateways: 

      - enabled: true 

        k8s: 

          hpaSpec: 

            minReplicas: 1 

          resources: 

            limits: 

              cpu: 500m 

              memory: 512Mi 

            requests: 

              cpu: 100m 

              memory: 128Mi 

          service: 

            ports: 

              - name: http 

                port: 80 

                targetPort: 8080 

                nodePort: 30949 

              - name: https 

                port: 443 

                targetPort: 8443 

                nodePort: 30950 

            type: LoadBalancer 

        name: istio-ingressgateway 

    pilot: 

      enabled: true 

      k8s: 

        hpaSpec: 

          minReplicas: 1 

        resources: 

          limits: 

            cpu: 300m 

            memory: 512Mi 

          requests: 

            cpu: 100m 

            memory: 128Mi 

  meshConfig: 

    accessLogFile: /dev/stdout 

    enableTracing: false 

    outboundTrafficPolicy: 

      mode: ALLOW_ANY 

  profile: default 

  

EOF
```
## DNS SETUP 
### Local setup
```bash
CLUSTER_IP=$(kubectl -n istio-system get svc istio-ingressgateway -o json | jq -r .spec.clusterIP) 
```
```bash

kubectl apply -f - <<EOF 

kind: ConfigMap 

apiVersion: v1 

metadata: 

  name: coredns 

  namespace: kube-system 

data: 

  Corefile: | 

    .:53 { 

        errors 

        health { 

           lameduck 5s 

        } 

        rewrite name regex (.*)\.localho\.st host.ingress.internal 

        hosts { 

          ${CLUSTER_IP} host.ingress.internal 

          fallthrough 

        } 

        ready 

        kubernetes cluster.local in-addr.arpa ip6.arpa { 

           pods insecure 

           fallthrough in-addr.arpa ip6.arpa 

           ttl 30 

        } 

        prometheus :9153 

        forward . /etc/resolv.conf { 

           max_concurrent 1000 

        } 

        cache 30 

        loop 

        reload 

        loadbalance 

    } 

EOF
```
## Bevel Fabric Operator

```
helm repo add kfs https://kfsoftware.github.io/hlf-helm-charts --force-update

helm install hlf-operator --version=1.10.0 -- kfs/hlf-operator

```
