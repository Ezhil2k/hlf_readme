import express from 'express';
import { authenticateApiKey } from './auth.js';
import { invokeRouter } from './router/invoke.js';
import { queryRouter } from './router/query.js';
import { authRouter } from './router/auth.js';
import { StatusCodes } from 'http-status-codes';
import pinoMiddleware from 'pino-http';
const { BAD_REQUEST, INTERNAL_SERVER_ERROR } = StatusCodes;
import { logger } from './logger.js';

const app = express();
const PORT = process.env.PORT || 8080


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    pinoMiddleware({
        logger,
        customLogLevel: function customLogLevel(res, err) {
            if (
                res.statusCode >= BAD_REQUEST &&
                res.statusCode < INTERNAL_SERVER_ERROR
            ) {
                return 'warn';
            }

            if (res.statusCode >= INTERNAL_SERVER_ERROR || err) {
                return 'error';
            }
            return 'debug';
        },
        prettyPrint: {
            colorize: true,
        },
    })
);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/invoke', authenticateApiKey, invokeRouter);
app.use('/api/v1/query', authenticateApiKey, queryRouter);

app.listen(PORT, () => {
    logger.info(`server started on port ${PORT}`)
})
