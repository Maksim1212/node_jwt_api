const { Router } = require('express');
const AuthUserComponent = require('../Auth');
const Auth = require('../../polices/isAuth');


/**
 * Express router to auth user related functions on.
 * @type {Express.Router}
 * @const
 */
const authUserRouter = Router();

/**
 * Route post user signin action
 * @name /signin
 * @function
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
authUserRouter.post('/signin', AuthUserComponent.signin);

/**
 * Route get user logout action
 * @name /v1/auth/logout
 * @function
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
authUserRouter.get('/logout', AuthUserComponent.logout);


/**
 * Route post create new user
 * @name /v1/auth/createUser
 * @function
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
authUserRouter.post('/signup', AuthUserComponent.createUser);

/**
 * Route get user info
 * @name /v1/auth/createUser
 * @function
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
authUserRouter.get('/info', AuthUserComponent.info);

/**
 * Route get google.com latency info
 * @name /v1/auth/createUser
 * @function
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
authUserRouter.get('/latency', AuthUserComponent.latency);

/**
 * Route post update user JWT token
 * @name /v1/auth/login
 * @function
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
authUserRouter.post('/updateToken', Auth.isAuthJWT);

module.exports = authUserRouter;
