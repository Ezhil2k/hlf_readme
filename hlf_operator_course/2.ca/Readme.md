# Certificate Authority (CA)

## Configuration

```bash
export SC=$(kubectl get sc -o=jsonpath='{.items[0].metadata.name}')
export CA_IMAGE=hyperledger/fabric-ca
export CA_VERSION=1.5.6
export DOMAIN=blockchain-network.online #localho.st when running in kind cluster
```

## CA Setup

### Org1 CA

```bash
kubectl create ns org1

kubectl hlf ca create  --image=$CA_IMAGE --version=$CA_VERSION --storage-class=$SC --capacity=1Gi --name=org1-ca \
    --enroll-id=enroll --enroll-pw=enrollpw --hosts=org1-ca.$DOMAIN --istio-port=443 --namespace=org1

kubectl hlf ca create  --image=$CA_IMAGE --version=$CA_VERSION --storage-class=$SC --capacity=1Gi --name=org1-ca \
    --enroll-id=enroll --enroll-pw=enrollpw --hosts=org1-ca.$DOMAIN --istio-port=443 --namespace=org1 --output >org1-ca.yaml
```

### Org2 CA

```bash
kubectl create ns org2

kubectl hlf ca create  --image=$CA_IMAGE --version=$CA_VERSION --storage-class=$SC --capacity=1Gi --name=org2-ca \
    --enroll-id=enroll --enroll-pw=enrollpw --hosts=org2-ca.$DOMAIN --istio-port=443 --namespace=org2
```

### Orderer CA

```bash
kubectl create ns orderer

kubectl hlf ca create  --image=$CA_IMAGE --version=$CA_VERSION --storage-class=$SC --capacity=1Gi --name=orderer-ca \
    --enroll-id=enroll --enroll-pw=enrollpw --hosts=orderer-ca.$DOMAIN --istio-port=443 --namespace=orderer
```
