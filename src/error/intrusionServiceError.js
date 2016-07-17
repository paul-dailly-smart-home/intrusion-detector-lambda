module.exports = function IntrusionServiceError(message, code) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
    this.code = code;
};

require('util').inherits(module.exports, Error);