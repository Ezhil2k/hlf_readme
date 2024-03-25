# Monitoring

```bash
export DOMAIN=blockchain-network.online #localho.st when running in kind cluster
export SC=$(kubectl get sc -o=jsonpath='{.items[0].metadata.name}')
```

## Prometheus Setup

### Helm repo

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
```

### Helm values file

```bash
cat << EOF > values.yaml
prometheus:
  enabled: true
  ingress:
    enabled: true
    ingressClassName: istio
    hosts: 
      - prometheus.$DOMAIN
    paths: 
     - /
    pathType: Prefix
  storageSpec:
     volumeClaimTemplate:
       spec:
         storageClassName: $SC
         accessModes: ["ReadWriteOnce"]
         resources:
           requests:
             storage: 1Gi
grafana:
  enabled: true
  adminPassword: admin@123
  ingress:
    enabled: true
    ingressClassName: istio
    hosts:
     - grafana.$DOMAIN

alertmanager:
  enabled: false
EOF
```


### Prometheus Installation

```bash
helm upgrade --install prometheus prometheus-community/kube-prometheus-stack -f values.yaml --namespace monitoring --create-namespace
```

## Grafana Dashboard

```bash
kubectl create configmap -n monitoring hlf-dashboard --from-file=dashboard.json
kubectl label configmap -n monitoring hlf-dashboard grafana_dashboard=1
```
