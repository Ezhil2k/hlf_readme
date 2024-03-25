# Caliper Setup
## Installation
install all the required node modules
```
npm i
```
## Directory Structure
```
caliper
├── benchmark
│   └── config.yaml
├── network
│   ├── ccp.yaml
│   └── network.yaml
├── package.json
├── README.md
└── workload
    ├── invoke.js
    └── read.js
```
1. Benchmark - contains the caliper benchmarking configuration. You the define the behaviour of caliper in the `config.yaml`.
2. Network - the network configuration details. It contain two files `ccp.yaml` and `network.yaml` . ccp.yaml is the connection profile while `network.yaml` is the caliper specific network config.
3. Workload - contains the actual implementation of the benchmarking. In the `submitTransaction()` function we define the implementation. We have to create a payload containing `contractId`, `channelName`, `contractFunction`, `contractArguments` and `readOnly` flag.

## Running Caliper

```
npx caliper bind --caliper-bind-sut fabric:2.2
```

```
npx caliper launch manager --caliper-workspace ./ --caliper-networkconfig ./network/network.yaml --caliper-benchconfig ./benchmark/config.yaml --caliper-flow-only-test --caliper-fabric-gateway-enabled=true --caliper-fabric-gateway-localhost=false
```
