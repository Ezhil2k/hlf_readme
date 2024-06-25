# Blockchain Explorer

## Namespace

```bash
kubectl create namespace explorer
```

## Configuration

Update the configmap with the values for explorer
```bash
kubectl apply -f configmap.yaml
```

## Explorer Deployment

```bash
kubectl apply -f explorerdb.yaml
kubectl apply -f explorer.yaml
```
