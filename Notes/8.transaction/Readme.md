# Interacting with chaincode

```bash
CC_NAME=cc-go
```

## Invoke chaincode
```
kubectl hlf chaincode invoke --config=networkConfig.yaml --user=admin --peer=org1-peer1.org1 --chaincode=$CC_NAME --channel=testchannel --fcn=CreateAsset -a "1000" -a "red" -a "5" -a "aditya" -a "5000"
```

## Query
```
kubectl hlf chaincode query --config=networkConfig.yaml --user=admin --peer=org1-peer1.org1 --chaincode=$CC_NAME --channel=testchannel --fcn=GetAllAssets
```

```
kubectl hlf chaincode query --config=networkConfig.yaml --user=admin --peer=org1-peer1.org1 --chaincode=$CC_NAME --channel=testchannel --fcn=ReadAsset -a '1000'
```
