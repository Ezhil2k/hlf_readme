import dotenv from 'dotenv';
dotenv.config();

const API_KEY=process.env.API_KEY

export const authenticateApiKey = (req, res, next) => {
    const providedApiKey = req.headers['x-api-key'];
  
    if (!providedApiKey || providedApiKey !== API_KEY) {
      return res.status(401).json({ error: 'Unauthorized - Invalid API Key' });
    }
  
    // API key is valid, continue to the next middleware or route
    next();
  };
