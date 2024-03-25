# Channel

## Channel creation

```bash
kubectl hlf channel generate --output=testchannel.block --name=testchannel --organizations Org1MSP --organizations Org2MSP --ordererOrganizations OrdererMSP
```

## Channel join - orderer

```bash
kubectl hlf ordnode join --block=testchannel.block --name=orderer-node1 --namespace=orderer --identity=orderer-admin-tls.yaml
kubectl hlf ordnode join --block=testchannel.block --name=orderer-node2 --namespace=orderer --identity=orderer-admin-tls.yaml
kubectl hlf ordnode join --block=testchannel.block --name=orderer-node3 --namespace=orderer --identity=orderer-admin-tls.yaml
```

## Channel join - peer

```bash
kubectl hlf channel join --name=testchannel --config=networkConfig.yaml --user=admin -p=org1-peer1.org1
kubectl hlf channel join --name=testchannel --config=networkConfig.yaml --user=admin -p=org1-peer2.org1
kubectl hlf channel join --name=testchannel --config=networkConfig.yaml --user=admin -p=org2-peer1.org2
kubectl hlf channel join --name=testchannel --config=networkConfig.yaml --user=admin -p=org2-peer2.org2
```

## Anchor Peer

```bash
kubectl hlf channel addanchorpeer --channel=testchannel --config=networkConfig.yaml --user=admin --peer=org1-peer1.org1
kubectl hlf channel addanchorpeer --channel=testchannel --config=networkConfig.yaml --user=admin --peer=org2-peer1.org2
```
