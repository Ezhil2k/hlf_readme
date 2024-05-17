#Network cleanup
```bash
kubectl delete fabricorderernodes.hlf.kungfusoftware.es --all-namespaces --all
kubectl delete fabricpeers.hlf.kungfusoftware.es --all-namespaces --all
kubectl delete fabriccas.hlf.kungfusoftware.es --all-namespaces --all
kubectl delete fabricchaincode.hlf.kungfusoftware.es --all-namespaces --all
kubectl delete fabricmainchannels --all-namespaces --all
kubectl delete fabricfollowerchannels --all-namespaces --all
kubectl delete secret wallet -n fabric
```

# HLF Network Setup in Kubernetes with HLF Operator
```bash
export PEER_IMAGE=hyperledger/fabric-peer 
export PEER_VERSION=2.5.5 
export ORDERER_IMAGE=hyperledger/fabric-orderer 
export ORDERER_VERSION=2.5.5 
export CA_IMAGE=hyperledger/fabric-ca 
export CA_VERSION=1.5.7
```
## CA Creation

Set STORAGE_CLASS to gp2 or standard.

```bash
kubectl create ns fabric  
export STORAGE_CLASS=standard 

kubectl hlf ca create  --image=$CA_IMAGE --version=$CA_VERSION --storage-class=$STORAGE_CLASS --capacity=2Gi --name=org1-ca --enroll-id=enroll --enroll-pw=enrollpw --hosts=org1-ca.localho.st --istio-port=443 --namespace=fabric 

kubectl hlf ca create  --image=$CA_IMAGE --version=$CA_VERSION --storage-class=$STORAGE_CLASS --capacity=2Gi --name=org2-ca --enroll-id=enroll --enroll-pw=enrollpw --hosts=org2-ca.localho.st --istio-port=443 --namespace=fabric 

kubectl hlf ca create  --image=$CA_IMAGE --version=$CA_VERSION --storage-class=$STORAGE_CLASS --capacity=2Gi --name=ord-ca --enroll-id=enroll --enroll-pw=enrollpw --hosts=ord-ca.localho.st --istio-port=443 --namespace=fabric 
```
## Peer Registerations on CA 

```bash
kubectl hlf ca register --name=org1-ca --user=org1-peer1 --secret=peerpw --type=peer --enroll-id enroll --enroll-secret=enrollpw --mspid=Org1MSP --namespace=fabric 

kubectl hlf ca register --name=org1-ca --user=org1-peer2 --secret=peerpw --type=peer --enroll-id enroll --enroll-secret=enrollpw --mspid=Org1MSP --namespace=fabric 

kubectl hlf ca register --name=org2-ca --user=org2-peer1 --secret=peerpw --type=peer --enroll-id enroll --enroll-secret=enrollpw --mspid=Org2MSP --namespace=fabric 

kubectl hlf ca register --name=org2-ca --user=org2-peer2 --secret=peerpw --type=peer --enroll-id enroll --enroll-secret=enrollpw --mspid=Org2MSP --namespace=fabric 

kubectl hlf ca register --name=ord-ca --user=orderer --secret=ordererpw --type=orderer --enroll-id enroll --enroll-secret=enrollpw --mspid=OrdererMSP --namespace=fabric  
```
## Peer and Orderer Creation 
```bash
kubectl hlf peer create --storage-class=$STORAGE_CLASS --enroll-id=org1-peer1 --mspid=Org1MSP --enroll-pw=peerpw --capacity=3Gi --name=org1-peer1 --ca-name=org1-ca.fabric --namespace=fabric --statedb=couchdb --hosts=peer1-org1.localho.st --istio-ingressgateway=ingressgateway --istio-port=443 

kubectl hlf peer create --storage-class=$STORAGE_CLASS --enroll-id=org1-peer2 --mspid=Org1MSP --enroll-pw=peerpw --capacity=3Gi --name=org1-peer2 --ca-name=org1-ca.fabric --namespace=fabric --statedb=couchdb --hosts=peer2-org1.localho.st --istio-ingressgateway=ingressgateway --istio-port=443 

kubectl hlf peer create --storage-class=$STORAGE_CLASS --enroll-id=org2-peer1 --mspid=Org2MSP --enroll-pw=peerpw --capacity=3Gi --name=org2-peer1 --ca-name=org2-ca.fabric --namespace=fabric --statedb=couchdb --hosts=peer1-org2.localho.st --istio-ingressgateway=ingressgateway --istio-port=443 

kubectl hlf peer create --storage-class=$STORAGE_CLASS --enroll-id=org2-peer2 --mspid=Org2MSP --enroll-pw=peerpw --capacity=3Gi --name=org2-peer2 --ca-name=org2-ca.fabric --namespace=fabric --statedb=couchdb --hosts=peer2-org2.localho.st --istio-ingressgateway=ingressgateway --istio-port=443 

kubectl hlf ordnode create --image=$ORDERER_IMAGE --version=$ORDERER_VERSION  --storage-class=$STORAGE_CLASS --enroll-id=orderer --mspid=OrdererMSP     --enroll-pw=ordererpw --capacity=2Gi --name=ord-node1 --ca-name=ord-ca.fabric --hosts=orderer0-ord.localho.st --istio-port=443 --namespace=fabric 
```
## Register User for Peers and Orderers 

```bash
kubectl hlf ca register --name=org1-ca --user=admin --secret=adminpw --type=admin --enroll-id enroll --enroll-secret=enrollpw --mspid=Org1MSP --namespace=fabric 

kubectl hlf ca enroll --name=org1-ca --user=admin --secret=adminpw --ca-name ca  --output org1msp.yaml --mspid=Org1MSP --namespace=fabric 

kubectl hlf ca register --name=org2-ca --user=admin --secret=adminpw --type=admin --enroll-id enroll --enroll-secret=enrollpw --mspid=Org2MSP --namespace=fabric 

kubectl hlf ca enroll --name=org2-ca --user=admin --secret=adminpw --ca-name ca  --output org2msp.yaml --mspid=Org2MSP --namespace=fabric 

kubectl hlf ca register --name=ord-ca --user=admin --secret=adminpw --type=admin --enroll-id enroll --enroll-secret=enrollpw --mspid=OrdererMSP --namespace=fabric 

kubectl hlf ca enroll --name=ord-ca --namespace=fabric --user=admin --secret=adminpw --mspid OrdererMSP --ca-name tlsca  --output orderermsp.yaml 
```

## Store certificates as secrets inside the wallet 
```bash
kubectl create secret generic wallet --namespace=fabric --from-file=org1msp.yaml=$PWD/org1msp.yaml --from-file=orderermsp.yaml=$PWD/orderermsp.yaml --from-file=org2msp.yaml=$PWD/org2msp.yaml 
```

## Channel Creation: 

```bash
export PEER_ORG_SIGN_CERT=$(kubectl get fabriccas org1-ca -n=fabric -o=jsonpath='{.status.ca_cert}')
export PEER_ORG_TLS_CERT=$(kubectl get fabriccas org1-ca -n=fabric -o=jsonpath='{.status.tlsca_cert}')
export IDENT_8=$(printf "%8s" "")
export ORDERER_TLS_CERT=$(kubectl get fabriccas ord-ca -n=fabric -o=jsonpath='{.status.tlsca_cert}' | sed -e "s/^/${IDENT_8}/")
export ORDERER0_TLS_CERT=$(kubectl get fabricorderernodes ord-node1 -n=fabric -o=jsonpath='{.status.tlsCert}' | sed -e "s/^/${IDENT_8}/")
```
```bash
kubectl apply -f - <<EOF 

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

  

EOF
```
## Attach Peers to the Channel: 
```bash
export IDENT_8=$(printf "%8s" "")
export ORDERER0_TLS_CERT=$(kubectl get fabricorderernodes ord-node1 -n=fabric -o=jsonpath='{.status.tlsCert}' | sed -e "s/^/${IDENT_8}/")
```
```bash
kubectl apply -f - <<EOF 

apiVersion: hlf.kungfusoftware.es/v1alpha1 

kind: FabricFollowerChannel 

metadata: 

  name: mychannel-org1msp 

spec: 

  anchorPeers: 

    - host: org1-peer1.fabric 

      port: 7051 

  hlfIdentity: 

    secretKey: org1msp.yaml 

    secretName: wallet 

    secretNamespace: fabric 

  mspId: Org1MSP 

  name: mychannel 

  externalPeersToJoin: [] 

  orderers: 

    - certificate: | 

${ORDERER0_TLS_CERT} 

      url: grpcs://ord-node1.fabric:7050 

  peersToJoin: 

    - name: org1-peer1 

      namespace: fabric 

    - name: org1-peer2 

      namespace: fabric 

EOF

```
```bash
kubectl apply -f - <<EOF 

apiVersion: hlf.kungfusoftware.es/v1alpha1 

kind: FabricFollowerChannel 

metadata: 

  name: mychannel-org2msp 

spec: 

  anchorPeers: 

    - host: org2-peer1.fabric 

      port: 7051 

  hlfIdentity: 

    secretKey: org2msp.yaml 

    secretName: wallet 

    secretNamespace: fabric 

  mspId: Org2MSP 

  name: mychannel 

  externalPeersToJoin: [] 

  orderers: 

    - certificate: | 

${ORDERER0_TLS_CERT} 

      url: grpcs://ord-node1.fabric:7050 

  peersToJoin: 

    - name: org2-peer1 

      namespace: fabric 

    - name: org2-peer2 

      namespace: fabric 
EOF
```
## Generate Network Configuration file 
```bash
kubectl hlf inspect -n=fabric --output networkConfig.yaml -o Org1MSP -o OrdererMSP -o Org2MSP 
kubectl hlf utils adduser --userPath=org1msp.yaml --config=networkConfig.yaml --username=admin --mspid=Org1MSP 
kubectl hlf utils adduser --userPath=org2msp.yaml --config=networkConfig.yaml --username=admin --mspid=Org2MSP
```
# Chaincode Setup

## Chaincode Packaging

```bash
CC_NAME=cc-node
cat <<METADATA-EOF >"metadata.json"
    {
        "type": "ccaas",
        "label": "${CC_NAME}"
     }
METADATA-EOF

cat <<CONN_EOF >"connection.json"
    {
    "address": "${CC_NAME}:7052",
    "dial_timeout": "10s",
    "tls_required": false
    }
CONN_EOF

tar cfz code.tar.gz connection.json
tar cfz ${CC_NAME}-external.tgz metadata.json code.tar.gz
PACKAGE_ID=$(kubectl-hlf chaincode calculatepackageid --path=$CC_NAME-external.tgz --language=node --label=$CC_NAME)
echo "PACKAGE_ID=$PACKAGE_ID"
```

## Installation

```bash
kubectl hlf chaincode install --path=./${CC_NAME}-external.tgz --config=networkConfig.yaml --language=node --label=$CC_NAME --user=admin --peer=org1-peer1.fabric

kubectl hlf chaincode install --path=./${CC_NAME}-external.tgz --config=networkConfig.yaml --language=node --label=$CC_NAME --user=admin --peer=org1-peer2.fabric

kubectl hlf chaincode install --path=./${CC_NAME}-external.tgz --config=networkConfig.yaml --language=node --label=$CC_NAME --user=admin --peer=org2-peer1.fabric

kubectl hlf chaincode install --path=./${CC_NAME}-external.tgz --config=networkConfig.yaml --language=node --label=$CC_NAME --user=admin --peer=org2-peer2.fabric
```

## Chaincode Service Deployment

```bash
IMAGE_NAME=ezhil2k/hlf-for-fun:6.3
kubectl hlf externalchaincode sync --image=$IMAGE_NAME --name=$CC_NAME --namespace=fabric --package-id=$PACKAGE_ID --tls-required=false --replicas=1
```

## Chaincode Approval

```bash
kubectl hlf chaincode approveformyorg --config=networkConfig.yaml --user=admin --peer=org1-peer1.fabric --package-id=$PACKAGE_ID --version 1.0 --sequence 1 --name=$CC_NAME --policy="OR('Org1MSP.member','Org2MSP.member')" --channel=mychannel


kubectl hlf chaincode approveformyorg --config=networkConfig.yaml --user=admin --peer=org2-peer1.fabric --package-id=$PACKAGE_ID --version 1.0 --sequence 1 --name=$CC_NAME --policy="OR('Org1MSP.member','Org2MSP.member')" --channel=mychannel
```

## Chaincode commit

```bash
kubectl hlf chaincode commit --config=networkConfig.yaml --mspid=Org1MSP --user=admin --version 1.0 --sequence 1 --name=$CC_NAME --policy="OR('Org1MSP.member','Org2MSP.member')" --channel=testchannel
```

