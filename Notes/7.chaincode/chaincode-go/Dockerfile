ARG GO_VER=1.17
ARG ALPINE_VER=3.16

FROM golang:${GO_VER}-alpine${ALPINE_VER}  AS build

WORKDIR /go/src/github.com/adityajoshi12/chaincode-go
COPY . .

RUN go get -d -v ./... && go install -v ./...
RUN go build -o chaincode .


FROM alpine:3.11 AS prod

COPY --from=build /go/src/github.com/adityajoshi12/chaincode-go/chaincode /app/chaincode

USER 1000

WORKDIR /app

EXPOSE 9999
CMD ["./chaincode"]
