# Peer Setup

```bash
export SC=$(kubectl get sc -o=jsonpath='{.items[0].metadata.name}')
export PEER_IMAGE=hyperledger/fabric-peer
export PEER_VERSION=2.5.3
export DOMAIN=blockchain-network.online #localho.st when running in kind cluster
```

## Register Identites

```bash
# register user in CA for peers
kubectl hlf ca register --name=org1-ca --user=peer1 --secret=peer1pw --type=peer \
 --enroll-id enroll --enroll-secret=enrollpw --mspid Org1MSP --namespace=org1


kubectl hlf ca register --name=org1-ca --user=peer2 --secret=peer2pw --type=peer \
 --enroll-id enroll --enroll-secret=enrollpw --mspid Org1MSP --namespace=org1
```

```bash
# register user in CA for peers
kubectl hlf ca register --name=org2-ca --user=peer1 --secret=peer1pw --type=peer \
 --enroll-id enroll --enroll-secret=enrollpw --mspid Org2MSP --namespace=org2


kubectl hlf ca register --name=org2-ca --user=peer2 --secret=peer2pw --type=peer \
 --enroll-id enroll --enroll-secret=enrollpw --mspid Org2MSP --namespace=org2
```

### Org1 Peers

```bash
kubectl hlf peer create --statedb=couchdb --image=$PEER_IMAGE --version=$PEER_VERSION --storage-class=$SC --enroll-id=peer1 --enroll-pw=peer1pw \
        --mspid=Org1MSP --capacity=10Gi --name=org1-peer1 --ca-name=org1-ca.org1 \
        --hosts=peer1-org1.$DOMAIN --istio-port=443 --namespace=org1


kubectl hlf peer create --statedb=couchdb --image=$PEER_IMAGE --version=$PEER_VERSION --storage-class=$SC --enroll-id=peer2 --enroll-pw=peer2pw \
        --mspid=Org1MSP --capacity=10Gi --name=org1-peer2 --ca-name=org1-ca.org1 \
        --hosts=peer2-org1.$DOMAIN --istio-port=443 --namespace=org1
```

```bash
openssl s_client -connect peer1-org1.$DOMAIN:443
openssl s_client -connect peer2-org1.$DOMAIN:443
```

### Org2 Peers

```bash
kubectl hlf peer create --statedb=couchdb --image=$PEER_IMAGE --version=$PEER_VERSION --storage-class=$SC --enroll-id=peer1 --enroll-pw=peer1pw \
        --mspid=Org2MSP --capacity=10Gi --name=org2-peer1 --ca-name=org2-ca.org2 \
        --hosts=peer1-org2.$DOMAIN --istio-port=443 --namespace=org2

kubectl hlf peer create --statedb=couchdb --image=$PEER_IMAGE --version=$PEER_VERSION --storage-class=$SC --enroll-id=peer2 --enroll-pw=peer2pw \
        --mspid=Org2MSP --capacity=10Gi --name=org2-peer2 --ca-name=org2-ca.org2 \
        --hosts=peer2-org2.$DOMAIN --istio-port=443 --namespace=org2
```
