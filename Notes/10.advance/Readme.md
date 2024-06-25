# Extending Blockchain network

## Add new orderer node

``` bash
export SC=$(kubectl get sc -o=jsonpath='{.items[0].metadata.name}')
export ORDERER_IMAGE=hyperledger/fabric-orderer
export ORDERER_VERSION=2.5.3
export DOMAIN=blockchain-network.online #localho.st when running in kind cluster
```

### Register Identity

```bash
kubectl hlf ca register --name=orderer-ca --user=orderer4 --secret=orderer4pw \
    --type=orderer --enroll-id enroll --enroll-secret=enrollpw --mspid=OrdererMSP --namespace=orderer
```

### Creating Orderer

```bash
kubectl hlf ordnode create --image=$ORDERER_IMAGE --version=$ORDERER_VERSION \
    --storage-class=$SC --enroll-id=orderer4 --mspid=OrdererMSP \
    --enroll-pw=orderer4pw --capacity=20Gi --name=orderer-node4 --ca-name=orderer-ca.orderer \
    --hosts=orderer4-ord.$DOMAIN --istio-port=443 --namespace=orderer --admin-hosts=orderer4-admin-ord.$DOMAIN
```

### Joining channel

```bash
kubectl hlf ordnode join --block=testchannel.block --name=orderer-node4 --namespace=orderer --identity=orderer-admin-tls.yaml
```

### Checking consenter list

```bash
kubectl hlf channel inspect --channel=testchannel --config=networkConfig.yaml \
   --user=admin -p=org1-peer1.org1 > testchannel.json
```

### Enroll Orderer Admin - MSP Certs

```bash
kubectl hlf ca enroll --name=orderer-ca \
  --user=admin --secret=adminpw --mspid OrdererMSP \
  --ca-name ca --namespace=orderer --output orderer-admin-msp.yaml

cp networkConfig.yaml ordservice.yaml

kubectl hlf utils adduser --userPath=orderer-admin-msp.yaml --config=ordservice.yaml --username=admin --mspid=OrdererMSP
```

### Updating Consenter List

```bash 
kubectl hlf channel consenter add --config=ordservice.yaml \
    --orderers=orderer-node4.orderer \
    --user=admin --channel=testchannel \
    --mspid=OrdererMSP --output=add_orderers_consenter.pb
```

```bash
kubectl hlf channel update --channel=testchannel -f add_orderers_consenter.pb \
   --config=ordservice.yaml --user=admin --mspid=OrdererMSP
```

### Verify consenter list

```bash
kubectl hlf channel inspect --channel=testchannel --config=networkConfig.yaml --user=admin -p=org1-peer1.org1 > testchannel.json
```

## Adding new peer node

```bash
export SC=$(kubectl get sc -o=jsonpath='{.items[0].metadata.name}')
export PEER_IMAGE=hyperledger/fabric-peer
export PEER_VERSION=2.5.0
```

```bash
kubectl hlf ca register --name=org1-ca --user=peer3 --secret=peer3pw --type=peer \
 --enroll-id enroll --enroll-secret=enrollpw --mspid Org1MSP --namespace=org1
```

```bash
kubectl hlf peer create --statedb=couchdb --image=$PEER_IMAGE --version=$PEER_VERSION --storage-class=$SC --enroll-id=peer3 --enroll-pw=peer3pw \
        --mspid=Org1MSP --capacity=10Gi --name=org1-peer3 --ca-name=org1-ca.org1 \
        --hosts=peer3-org1.$DOMAIN --istio-port=443 --namespace=org1
```

### update networkconfig and add the new peer details

```bash
kubectl hlf channel join --name=testchannel --config=networkConfig.yaml --user=admin -p=org1-peer3.org1
```


## Adding new organisation

```bash
export SC=$(kubectl get sc -o=jsonpath='{.items[0].metadata.name}')
export CA_IMAGE=hyperledger/fabric-ca
export CA_VERSION=1.5.6
export PEER_IMAGE=hyperledger/fabric-peer
export PEER_VERSION=2.5.3
```

### Download Fabric Binaries

```bash
curl -Lo /tmp/fabric-binaries.tar.gz https://github.com/hyperledger/fabric/releases/download/v2.5.3/hyperledger-fabric-linux-amd64-2.5.3.tar.gz 
tar -xvf /tmp/fabric-binaries.tar.gz -C /tmp/
sudo mv /tmp/bin/* /usr/local/bin/
configtxlator version
```

### CA

```bash
kubectl create ns org3
kubectl hlf ca create  --image=$CA_IMAGE --version=$CA_VERSION --storage-class=$SC --capacity=1Gi --name=org3-ca \
    --enroll-id=enroll --enroll-pw=enrollpw --hosts=org3-ca.$DOMAIN --istio-port=443 --namespace=org3
```

### Register Peer

```bash
kubectl hlf ca register --name=org3-ca --user=peer1 --secret=peer1pw --type=peer \
 --enroll-id enroll --enroll-secret=enrollpw --mspid Org3MSP --namespace=org3
```

### Peer setup

```bash
kubectl hlf peer create --statedb=couchdb --image=$PEER_IMAGE --version=$PEER_VERSION --storage-class=$SC --enroll-id=peer1 --enroll-pw=peer1pw \
        --mspid=Org3MSP --capacity=10Gi --name=org3-peer1 --ca-name=org3-ca.org3 \
        --hosts=peer1-org3.$DOMAIN --istio-port=443 --namespace=org3

```

### Getting certificate

```bash
kubectl hlf org inspect -o Org3MSP --output-path=crypto-config
```

### Channel Update

```bash
kubectl hlf channel addorg --peer=org1-peer1.org1 --name=testchannel \
    --config=networkConfig.yaml --user=admin --msp-id=Org3MSP --org-config=configtx.yaml --dry-run > org3.json

configtxlator proto_encode --input org3.json --type common.ConfigUpdate --output org3.pb

echo '{"payload":{"header":{"channel_header":{"channel_id":"testchannel", "type":2}},"data":{"config_update":'$(cat org3.json)'}}}' | jq . > config_update_in_envelope.json

configtxlator proto_encode --input config_update_in_envelope.json --type common.Envelope --output config_update_in_envelope.pb

kubectl hlf channel signupdate --channel=testchannel -f config_update_in_envelope.pb --user=admin --config=networkConfig.yaml --mspid=Org1MSP --output org1-testchannel-update-sign.pb
kubectl hlf channel signupdate --channel=testchannel -f config_update_in_envelope.pb --user=admin --config=networkConfig.yaml --mspid=Org2MSP --output org2-testchannel-update-sign.pb

kubectl hlf channel update --channel testchannel -f config_update_in_envelope.pb --config=networkConfig.yaml --user=admin --mspid=Org1MSP -s org1-testchannel-update-sign.pb -s org2-testchannel-update-sign.pb
```

### Register Org3MSP Admin

```bash
kubectl hlf ca register --name=org3-ca --namespace=org3 --user=admin --secret=adminpw \
    --type=admin --enroll-id enroll --enroll-secret=enrollpw --mspid=Org3MSP

# enroll
kubectl hlf ca enroll --name=org3-ca --namespace=org3 \
    --user=admin --secret=adminpw --mspid Org3MSP \
    --ca-name ca  --output org3-admin-msp.yaml
```

#### Update networkConfig with the Org3 details

```bash
kubectl hlf inspect --output networkConfig.yaml -o Org1MSP -o OrdererMSP -o Org2MSP -o Org3MSP

kubectl hlf utils adduser --userPath=org1-admin-msp.yaml --config=networkConfig.yaml --username=admin --mspid=Org1MSP

kubectl hlf utils adduser --userPath=org2-admin-msp.yaml --config=networkConfig.yaml --username=admin --mspid=Org2MSP

kubectl hlf utils adduser --userPath=org3-admin-msp.yaml --config=networkConfig.yaml --username=admin --mspid=Org3MSP
```

### Join Channel

```bash
kubectl hlf channel join --name=testchannel --config=networkConfig.yaml \
    --user=admin -p=org3-peer1.org3
```
