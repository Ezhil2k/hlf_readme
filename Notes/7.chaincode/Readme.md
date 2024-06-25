# Chaincode Setup

## Chaincode Packaging

```bash
CC_NAME=cc-go
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
kubectl hlf chaincode install --path=./${CC_NAME}-external.tgz --config=networkConfig.yaml --language=node --label=$CC_NAME --user=admin --peer=org1-peer1.org1

kubectl hlf chaincode install --path=./${CC_NAME}-external.tgz --config=networkConfig.yaml --language=node --label=$CC_NAME --user=admin --peer=org1-peer2.org1

kubectl hlf chaincode install --path=./${CC_NAME}-external.tgz --config=networkConfig.yaml --language=node --label=$CC_NAME --user=admin --peer=org2-peer1.org2

kubectl hlf chaincode install --path=./${CC_NAME}-external.tgz --config=networkConfig.yaml --language=node --label=$CC_NAME --user=admin --peer=org2-peer2.org2
```

## Chaincode Service Deployment

```bash
kubectl hlf externalchaincode sync --image=adityajoshi12/chaincode-go:1.0 --name=$CC_NAME --namespace=org1 --package-id=$PACKAGE_ID --tls-required=false --replicas=1

kubectl hlf externalchaincode sync --image=adityajoshi12/chaincode-go:1.0 --name=$CC_NAME --namespace=org2 --package-id=$PACKAGE_ID --tls-required=false --replicas=1
```

## Chaincode Approval

```bash
kubectl hlf chaincode approveformyorg --config=networkConfig.yaml --user=admin --peer=org1-peer1.org1 --package-id=$PACKAGE_ID --version 1.0 --sequence 1 --name=$CC_NAME --policy="OR('Org1MSP.member','Org2MSP.member')" --channel=testchannel


kubectl hlf chaincode approveformyorg --config=networkConfig.yaml --user=admin --peer=org2-peer1.org2 --package-id=$PACKAGE_ID --version 1.0 --sequence 1 --name=$CC_NAME --policy="OR('Org1MSP.member','Org2MSP.member')" --channel=testchannel
```

## Chaincode commit

```bash
kubectl hlf chaincode commit --config=networkConfig.yaml --mspid=Org1MSP --user=admin --version 1.0 --sequence 1 --name=$CC_NAME --policy="OR('Org1MSP.member','Org2MSP.member')" --channel=testchannel
```
