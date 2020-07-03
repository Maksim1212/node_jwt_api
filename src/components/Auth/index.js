/* eslint-disable no-else-return */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

const AuthUserService = require('../Auth/service');
const AuthUserValidation = require('../Auth/validation');
const ValidationError = require('../../error/ValidationError');
const { getUserMainFields } = require('../../helpers/user');

const defaultError = 'An error has occurred';
const userNotFound = 'This Email not found';
const wrongPassword = 'Wrong Password';
const saltRounds = 10;

async function getJWTTokens(user) {
    const accessToken = jwt.sign({ user }, process.env.JWT_Access_Secret_KEY, { expiresIn: 300 });
    const refreshToken = jwt.sign({}, process.env.JWT_Refresh_Secret_KEY, { expiresIn: '600' });

    await AuthUserService.updateRefreshToken(user, refreshToken);
    return {
        accessToken,
        refreshToken,
    };
}

/**
 * @function
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {Promise<void>}
 */
async function createUser(req, res, next) {
    try {
        if (req.body.phone) {
            req.body.id_type = 'phone';
            req.body.id = req.body.phone;
            delete req.body.phone;
        } else if (req.body.email) {
            req.body.id_type = 'email';
            req.body.id = req.body.email;
            delete req.body.email;
        }
        const { error } = AuthUserValidation.createUser(req.body);
        if (error) {
            throw new ValidationError(error.details);
        }

        req.body.password = await bcrypt.hash(req.body.password, saltRounds);
        await AuthUserService.createUser(req.body);
        const user = await AuthUserService.findUser(req.body.email);
        const token = await getJWTTokens(user);
        return res.status(200).json({
            token: token.accessToken,
        });
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(422).json({
                error: error.message,
            });
        }
        if (error.name === 'MongoError') {
            return res.status(422).json({
                error: error.errmsg,
            });
        }
        return next(error);
    }
}

/**
 * @function signin
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {Promise<void>}
 */
async function signin(req, res, next) {
    try {
        const { error } = AuthUserValidation.signin(req.body);

        if (error) {
            throw new ValidationError(error.details);
        }

        const user = await AuthUserService.findUser(req.body.id);
        if (!user) {
            req.flash('error', { message: userNotFound });

            return res.status(401).json({
                message: userNotFound,
            });
        }
        if (!error && user) {
            const reqPassword = req.body.password;
            const userPassword = user.password;
            const passwordsMatch = await bcrypt.compare(reqPassword, userPassword);
            if (!passwordsMatch) {
                req.flash('error', { message: wrongPassword });
                return res.status(401).json({
                    message: wrongPassword,
                });
            }
            const token = await getJWTTokens(user);
            let data = {};
            data = {
                ...getUserMainFields(user),
                token,
            };
            req.session.user = data;
            return res.status(200).json({
                token: token.accessToken,
            });
        }
        return res.status(200);
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(401).json({
                error: error.message,
            });
        }

        if (error.name === 'MongoError') {
            return res.status(401).json({
                error: defaultError,
            });
        }
        return next(error);
    }
}

/**
 * @function info
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {Promise<void>}
 */

async function info(req, res) {
    if (req.session.user) {
        let id = req.session.user._id;
        const userInfo = await AuthUserService.findById(id);
        await getJWTTokens(req.session.user);
        return res.status(200).json({
            user_id: userInfo.id,
            id_type: userInfo.id_type,
        });
    } else {
        return res.status(200).json({
            message: 'signin to your account',
        });
    }
}

/**
 * @function logout
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {Promise < void >}
 */
async function logout(req, res) {
    try {
        if (req.query.all === 'true') {
            const refreshToken = null;
            await AuthUserService.logoutAll(refreshToken);
            return res.status(200).json({
                status: 200,
                message: 'users successfully logged out of the system',
            });
        } else {
            await AuthUserService.logout(req.session.user['_id']);
            delete req.session.user;
            return res.status(200).json({
                status: 200,
                message: 'user successfully logged out of the system',
            });
        }
    } catch (error) {
        return res.status(400).json({
            status: 400,
            message: error.message,
        });
    }
}

/**
 * @function latency
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @returns {Promise<void>}
 */

async function latency(req, res) {
    try {
        const target = 'https://google.com';
        const url = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${target}`;
        const response = await fetch(url);
        const json = await response.json();
        const lighthouse = json.lighthouseResult;
        const lighthouseMetrics = {
            'First Contentful Paint': lighthouse.audits['first-contentful-paint'].displayValue,
            'Speed Index': lighthouse.audits['speed-index'].displayValue,
            'Time To Interactive': lighthouse.audits['interactive'].displayValue,
            'First Meaningful Paint': lighthouse.audits['first-meaningful-paint'].displayValue,
            'First CPU Idle': lighthouse.audits['first-cpu-idle'].displayValue,
            'Estimated Input Latency': lighthouse.audits['estimated-input-latency'].displayValue,
        };
        return res.status(200).json({
            lighthouseMetrics,
        });
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
        });
    }
}


module.exports = {
    createUser,
    logout,
    signin,
    getJWTTokens,
    info,
    latency,
};
