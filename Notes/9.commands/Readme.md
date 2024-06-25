# Additional Commands

## Block

```bash
kubectl hlf channel top --channel=testchannel --config=networkConfig.yaml --user=admin -p=org1-peer1.org1
```

## Channel Block

```bash
kubectl hlf channel inspect --channel=testchannel --config=networkConfig.yaml --user=admin -p=org1-peer1.org1 > channel.json
```

## Chaincode - List Installed chaincode

```bash
kubectl hlf chaincode queryinstalled --config=networkConfig.yaml --user=admin --peer=org1-peer1.org1
```

## Chaincode - Query committed chaincode

```bash
kubectl hlf chaincode querycommitted --config=networkConfig.yaml --user=admin --peer=org1-peer1.org1 --channel=testchannel
```
