const Validation = require('../validation');

class AuthUserValidation extends Validation {
    /**
     * @param {String} profile.email
     * @param {String} profile.fullName
     * @param {String} profile.password
     * @returns
     * @memberof AuthUserValidation
     */
    createUser(profile) {
        return this.Joi
            .object({
                id: this.Joi.string().required(),
                password: this.Joi
                    .string()
                    .min(5)
                    .max(18)
                    .required(),
                id_type: this.Joi
                    .string()
                    .min(5)
                    .max(6)
                    .required(),
                _csrf: this.Joi.string(),
            })
            .validate(profile);
    }

    /**
     * @param {String} data.email
     * @param {String} data.password
     * @returns
     * @memberof AuthUserValidation
     */

    login(data) {
        return this.Joi
            .object({
                email: this.Joi.string().email().required(),
                password: this.Joi.string().required(),
                _csrf: this.Joi.string(),
            })
            .validate(data);
    }

    /**
     * @param {String} data.refreshToken
     * @returns
     * @memberof AuthUserValidation
     */

    updateToken(data) {
        return this.Joi
            .object({
                refreshToken: this.Joi.string().required(),
            }).validate(data);
    }
}
module.exports = new AuthUserValidation();
