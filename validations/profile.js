const validator = require('validator');
const isEmpty = require('./isEmpty');

module.exports = function validateProfileInput(data) {
    const errors = {};

    if (!isEmpty(data.website)) {
        if (!validator.isURL(data.website)) {
            errors.website = "Not a Valid URL.";
        }
    }

    if (isEmpty(data.handle)) {
        errors.handle = "Handle field is required";
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}