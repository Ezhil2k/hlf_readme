import express from 'express';
import {Gateway} from 'fabric-network'
export const invokeRouter = express.Router();
import { getWallet, getConnectionProfile } from './../utils.js';


invokeRouter.post("/", async (req, res) => {
    const gateway = new Gateway();
    const userId = req.headers.userid;
    const org = req.headers.org;
    const payload = req.body;
    const functionName = req.headers.function;
    const channelName = req.headers.channel;
    const chaincodeName = req.headers.chaincode;

    if (!functionName && !chaincodeName && !channelName && !userId) {
        res.send(400).json({ error: "Missing attributes" })
    }
    try {
        const wallet = await getWallet(org);
        const ccp = getConnectionProfile();
        await gateway.connect(ccp, {
            wallet,
            identity: userId,
            discovery: { enabled: true, asLocalhost: false } // using asLocalhost as this gateway is using a fabric network deployed locally
        });

        const network = await gateway.getNetwork(channelName);

        const contract = network.getContract(chaincodeName);

        let response = await contract.submitTransaction(functionName, ...payload);
        res.status(200).send({data: response.toString(), message: "send transaction successfully"})
    } catch (error){
      res.status(500).json({error: "failed to send transaction"})
    } finally {
        await gateway.close()
    }

});



