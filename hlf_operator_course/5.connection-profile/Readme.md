# Connection Profile

## Orderer Admin

```bash
# register
kubectl hlf ca register --name=orderer-ca --user=admin --secret=adminpw \
    --type=admin --enroll-id enroll --enroll-secret=enrollpw --mspid=OrdererMSP --namespace=orderer

# enroll

kubectl hlf ca enroll --name=orderer-ca --namespace=orderer \
    --user=admin --secret=adminpw --mspid OrdererMSP \
    --ca-name tlsca  --output orderer-admin-tls.yaml
```

## Org1 Admin

```bash
# register
kubectl hlf ca register --name=org1-ca --namespace=org1 --user=admin --secret=adminpw \
    --type=admin --enroll-id enroll --enroll-secret=enrollpw --mspid=Org1MSP

# enroll
kubectl hlf ca enroll --name=org1-ca --namespace=org1 \
    --user=admin --secret=adminpw --mspid Org1MSP \
    --ca-name ca  --output org1-admin-msp.yaml
```

## Org2 Admin

```bash
# register
kubectl hlf ca register --name=org2-ca --namespace=org2 --user=admin --secret=adminpw \
    --type=admin --enroll-id enroll --enroll-secret=enrollpw --mspid=Org2MSP

# enroll
kubectl hlf ca enroll --name=org2-ca --namespace=org2 \
    --user=admin --secret=adminpw --mspid Org2MSP \
    --ca-name ca  --output org2-admin-msp.yaml
```

## Generate Connection profile

```
kubectl hlf inspect --output networkConfig.yaml -o Org1MSP -o OrdererMSP -o Org2MSP

# add admin users to connection profile
kubectl hlf utils adduser --userPath=org1-admin-msp.yaml --config=networkConfig.yaml --username=admin --mspid=Org1MSP
kubectl hlf utils adduser --userPath=org2-admin-msp.yaml --config=networkConfig.yaml --username=admin --mspid=Org2MSP
```
