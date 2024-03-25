import express from 'express';
import { getWallet, getConnectionProfile } from './../utils.js';
import { logger } from '../logger.js';
import { Gateway } from 'fabric-network';
export const queryRouter = express.Router();

queryRouter.post("/", async (req, res) => {
    
    const userId = req.headers.userid;
    const org=req.headers.org
    const payload = req.body;
    const functionName = req.headers.function;
    const channelName = req.headers.channel;
    const chaincodeName = req.headers.chaincode;

    if (!functionName && !chaincodeName && !channelName && !userId && !org) {
        res.send(400).json({ error: "Missing attributes" })
    }

    const gateway = new Gateway();

    try {

        const wallet =await getWallet(org);
        const ccp = getConnectionProfile();
        await gateway.connect(ccp, {
            wallet,
            identity: userId,
            discovery: { enabled: true, asLocalhost: false } // using asLocalhost as this gateway is using a fabric network deployed locally
        });

        const network = await gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);
        let response = await contract.evaluateTransaction(functionName, ...payload);
        res.send(response)
    } catch (error){
        logger.error(error)
      res.status(500).json({error: "failed to send transaction"})
    } finally {
        await gateway.close()
    }

});


