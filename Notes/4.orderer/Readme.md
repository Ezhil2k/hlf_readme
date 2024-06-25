# Orderer Setup

```bash
export SC=$(kubectl get sc -o=jsonpath='{.items[0].metadata.name}')
export ORDERER_IMAGE=hyperledger/fabric-orderer
export ORDERER_VERSION=2.5.3
export DOMAIN=blockchain-network.online  #localho.st when running in kind cluster
```

```
kubectl hlf ca register --name=orderer-ca --user=orderer1 --secret=orderer1pw \
    --type=orderer --enroll-id enroll --enroll-secret=enrollpw --mspid=OrdererMSP --namespace=orderer

kubectl hlf ca register --name=orderer-ca --user=orderer2 --secret=orderer2pw \
    --type=orderer --enroll-id enroll --enroll-secret=enrollpw --mspid=OrdererMSP --namespace=orderer

kubectl hlf ca register --name=orderer-ca --user=orderer3 --secret=orderer3pw \
    --type=orderer --enroll-id enroll --enroll-secret=enrollpw --mspid=OrdererMSP --namespace=orderer

```

## Orderer Nodes

```bash
kubectl hlf ordnode create --image=$ORDERER_IMAGE --version=$ORDERER_VERSION \
    --storage-class=$SC --enroll-id=orderer1 --mspid=OrdererMSP \
    --enroll-pw=orderer1pw --capacity=20Gi --name=orderer-node1 --ca-name=orderer-ca.orderer \
    --hosts=orderer1-ord.$DOMAIN --istio-port=443 --namespace=orderer --admin-hosts=orderer1-admin-ord.$DOMAIN

kubectl hlf ordnode create --image=$ORDERER_IMAGE --version=$ORDERER_VERSION \
    --storage-class=$SC --enroll-id=orderer2 --mspid=OrdererMSP \
    --enroll-pw=orderer2pw --capacity=20Gi --name=orderer-node2 --ca-name=orderer-ca.orderer \
    --hosts=orderer2-ord.$DOMAIN --istio-port=443 --namespace=orderer --admin-hosts=orderer2-admin-ord.$DOMAIN

kubectl hlf ordnode create --image=$ORDERER_IMAGE --version=$ORDERER_VERSION \
    --storage-class=$SC --enroll-id=orderer3 --mspid=OrdererMSP \
    --enroll-pw=orderer3pw --capacity=20Gi --name=orderer-node3 --ca-name=orderer-ca.orderer \
    --hosts=orderer3-ord.$DOMAIN --istio-port=443 --namespace=orderer --admin-hosts=orderer3-admin-ord.$DOMAIN
```

```bash
openssl s_client -connect orderer1-ord.$DOMAIN:443
openssl s_client -connect orderer2-ord.$DOMAIN:443
openssl s_client -connect orderer3-ord.$DOMAIN:443
```
