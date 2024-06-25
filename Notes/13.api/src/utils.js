import { Wallets } from 'fabric-network'
import FabricCAServices from 'fabric-ca-client';
import {logger} from './logger.js'
import * as dotenv from 'dotenv'
import { join , resolve } from 'path'
dotenv.config()



export const getWallet = async (orgName) => {
    
    let walletPath = join(resolve(),"wallet", orgName)

    const wallet = await Wallets.newFileSystemWallet(walletPath);
    logger.info(`Built a file system wallet at ${walletPath}`);
    return wallet;
};


export const getConnectionProfile = () => {
    const connectionProfile = process.env.HLF_CONNECTION_PROFILE
    return JSON.parse(connectionProfile)
}

export const getCaClientUser = (orgName) => {
    let ccp = getConnectionProfile();
    let caInfo;
    if (orgName.includes("Org1")) {
        console.log(ccp.certificateAuthorities)
        caInfo = ccp.certificateAuthorities["org1-ca.org1"]; //lookup CA details from config

    } else {
        caInfo = ccp.certificateAuthorities["org2-ca.org2"]; //lookup CA details from config
    }

    const caTLSCACerts = caInfo.tlsCACerts.pem;
    const caClient = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

    console.log(`Built a CA Client named ${caInfo.caName}`);
    return { caClient, adminUserId: caInfo.registrar.enrollId, adminUserPasswd: caInfo.registrar.enrollSecret };
}
