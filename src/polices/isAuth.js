const jwt = require('jsonwebtoken');
// const passport = require('passport');

// const { Strategy } = require('passport-local');
const AuthUserService = require('../components/Auth/service');
const { getJWTTokens } = require('../components/Auth/index');

/**
 * @function
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {Promise < void >}
 */
async function isAuthJWT(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({
            status: 401,
            message: 'signin to your account',
        });
    }
    let token = req.session.user.token.accessToken;
    const tokens = await getJWTTokens(req.session.user.id);
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_Access_Secret_KEY);
    } catch (error) {
        if (error.message === 'jwt expired') {
            const user = await AuthUserService.getUserByRefreshToken(req.session.user.token.refreshToken);
            req.session.user.token.accessToken = tokens.accessToken;
            token = req.session.user.token.accessToken;
            decoded = jwt.verify(token, process.env.JWT_Access_Secret_KEY);
            if (!user) {
                return res.status(401).json({
                    status: 401,
                    message: error.message,
                });
            }
        } else {
            return res.status(403).json({
                status: 403,
                message: error.message,
            });
        }
    }
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp > currentTime) {
        return next();
    }
    return res.status(200);
}

module.exports = {
    isAuthJWT,
};
