import rateLimit from 'express-rate-limit'
import { logEvent } from '../helpers/logger.js'
const LoginRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // limit each IP to 100 requests per windowMs (1 minute)
    message:
    {
        message: 'Too many requests from this IP, please try again after an hour',
        statusCode: 429,
    },
    handler: (req, res, next, options) => {
        logEvent(`Too many Requests : ${options.message.message}\t${req.method}\t${req.url}
                \t${req.headers.origin}
                `, 'errorLog.log')
        res.status(options.statusCode).json(options.message)

    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

export default LoginRateLimiter