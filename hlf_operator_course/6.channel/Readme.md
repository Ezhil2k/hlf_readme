# Channel creation first approach
```
export PEER_ORG_SIGN_CERT=$(kubectl get fabriccas org1-ca -n=orderer -o=jsonpath='{.status.ca_cert}') 

export PEER_ORG_TLS_CERT=$(kubectl get fabriccas org1-ca -n=orderer -o=jsonpath='{.status.tlsca_cert}') 

export IDENT_8=$(printf "%8s" "") 

export ORDERER_TLS_CERT=$(kubectl get fabriccas orderer-ca -n=orderer -o=jsonpath='{.status.tlsca_cert}' | sed -e "s/^/${IDENT_8}/" ) 

export ORDERER0_TLS_CERT=$(kubectl get fabricorderernodes orderer-node1 -n=orderer -o=jsonpath='{.status.tlsCert}' | sed -e "s/^/${IDENT_8}/" ) 

export ORDERER1_TLS_CERT=$(kubectl get fabricorderernodes orderer-node2 -n=orderer -o=jsonpath='{.status.tlsCert}' | sed -e "s/^/${IDENT_8}/" ) 

export ORDERER2_TLS_CERT=$(kubectl get fabricorderernodes orderer-node3 -n=orderer -o=jsonpath='{.status.tlsCert}' | sed -e "s/^/${IDENT_8}/" ) 

```
## save as YAML file
```
apiVersion: hlf.kungfusoftware.es/v1alpha1
kind: FabricMainChannel
metadata:
  name: mychannel
spec:
  name: mychannel
  adminOrdererOrganizations:
    - mspID: OrdererMSP
  adminPeerOrganizations:
    - mspID: Org1MSP
  channelConfig:
    application:
      acls: null
      capabilities:
        - V2_0
      policies: null
    capabilities:
      - V2_0
    orderer:
      batchSize:
        absoluteMaxBytes: 1048576
        maxMessageCount: 10
        preferredMaxBytes: 524288
      batchTimeout: 2s
      capabilities:
        - V2_0
      etcdRaft:
        options:
          electionTick: 10
          heartbeatTick: 1
          maxInflightBlocks: 5
          snapshotIntervalSize: 16777216
          tickInterval: 500ms
      ordererType: etcdraft
      policies: null
      state: STATE_NORMAL
    policies: null
  externalOrdererOrganizations: []
  peerOrganizations:
    - mspID: Org1MSP
      caName: "org1-ca"
      caNamespace: "fabric"
    - mspID: Org2MSP
      caName: "org2-ca"
      caNamespace: "fabric"
  identities:
    OrdererMSP:
      secretKey: orderermsp.yaml
      secretName: wallet
      secretNamespace: fabric
    Org1MSP:
      secretKey: org1msp.yaml
      secretName: wallet
      secretNamespace: fabric
    Org2MSP:
      secretKey: org2msp.yaml
      secretName: wallet
      secretNamespace: fabric
  externalPeerOrganizations: []
  ordererOrganizations:
    - caName: "ord-ca"
      caNamespace: "fabric"
      externalOrderersToJoin:
        - host: ord-node1.fabric
          port: 7053
      mspID: OrdererMSP
      ordererEndpoints:
        - ord-node1.fabric:7050
      orderersToJoin: []
  orderers:
    - host: ord-node1.fabric
      port: 7050
      tlsCert: |-
        ${ORDERER0_TLS_CERT}

```
## To check channel status
```
kubectl get fabricmainchannels.hlf.kungfusoftware.es -A
```
# Channel creation second approach
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
