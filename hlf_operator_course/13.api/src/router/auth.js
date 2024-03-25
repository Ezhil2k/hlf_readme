import express from 'express';
export const authRouter = express.Router();
import { getWallet, getCaClientUser } from '../utils.js';
import { logger } from '../logger.js';
import {authenticateApiKey} from '../auth.js'


authRouter.post("/register", async (req, res) => {
    const org = req.headers.org
    const user = req.body.userId
    try {
        const caClientUser = getCaClientUser(org);
        const wallet = await getWallet(org);
        await enrollAdmin(caClientUser, wallet, org);
        await registerAndEnrollUser(caClientUser, wallet, org, user)
        res.status(201).json({ data: `${user} is registered successfully` })
    } catch (error) {
        logger.error(error)
        res.status(500).json({ error: error.message })
    }
});

authRouter.post("/enroll",authenticateApiKey,async(req,res)=>{
    const org = req.headers.org
    const userId = req.body.userId
    try {
        const caClientUser = getCaClientUser(org);
        const wallet = await getWallet(org);
        await enrollUser(caClientUser,wallet,org,userId)
        res.status(201).json({ data: `${userId} is enrolled successfully` })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }

})


const enrollAdmin = async (caClientUser, wallet, orgMspId) => {
    try {
        const { caClient, adminUserId, adminUserPasswd } = caClientUser;
        // Check to see if we've already enrolled the admin user.
        const identity = await wallet.get(adminUserId);
        if (identity) {
            logger.info('An identity for the admin user already exists in the wallet');
            return;
        }

        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await caClient.enroll({ enrollmentID: adminUserId, enrollmentSecret: adminUserPasswd });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: orgMspId,
            type: 'X.509',
        };
        await wallet.put(adminUserId, x509Identity);
        logger.info('Successfully enrolled admin user and imported it into the wallet');
    } catch (error) {
        logger.error(`Failed to enroll admin user : ${error}`);
    }
};

const enrollUser = async (caClientUser, wallet, orgMspId, userId) => {
    try {
        const { caClient } = caClientUser;
        // Check to see if we've already enrolled the admin user.
        const identity = await wallet.get(userId);
        if (identity) {
            logger.info('An identity for the user already exists in the wallet');
            return;
        }

        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await caClient.enroll({ 
            enrollmentID: userId, 
            enrollmentSecret: `${userId}pw` 
        });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: orgMspId,
            type: 'X.509',
        };
        await wallet.put(userId, x509Identity);
        logger.info('Successfully enrolled user and imported it into the wallet');
    } catch (error) {
        logger.error(`Failed to enroll admin user : ${error}`);
        throw error;
    }
};

const registerAndEnrollUser = async (caClientUser, wallet, orgMspId, userId) => {
    const { caClient, adminUserId } = caClientUser;
    try {
        // Check to see if we've already enrolled the user
        const userIdentity = await wallet.get(userId);
        if (userIdentity) {
            console.log(`An identity for the user ${userId} already exists in the wallet`);
            return;
        }
        // Must use an admin to register a new user
        const adminIdentity = await wallet.get(adminUserId);
        if (!adminIdentity) {
            console.log('An identity for the admin user does not exist in the wallet');
            console.log('Enroll the admin user before retrying');
            return;
        }

        // build a user object for authenticating with the CA
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, adminUserId);

        // Register the user, enroll the user, and import the new identity into the wallet.
        // if affiliation is specified by client, the affiliation value must be configured in CA
        await caClient.register({
            enrollmentID: userId,
            enrollmentSecret: `${userId}pw`,
            role: 'client',
            maxEnrollments: -1
        }, adminUser);
        const enrollment = await caClient.enroll({
            enrollmentID: userId,
            enrollmentSecret: `${userId}pw`,
        });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: orgMspId,
            type: 'X.509',
        };
        await wallet.put(userId, x509Identity);
        console.log(`Successfully registered and enrolled user ${userId} and imported it into the wallet`);
    } catch (error) {
        if (error.message.includes("already registered")) {
            throw new Error(`${userId} is aleady register but not present in wallet, please enroll the user`)
        } else {
            logger.error(`Failed to register user : ${error}`);
            throw error
        }
    }
};
