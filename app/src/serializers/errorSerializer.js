class ErrorSerializer {

    static serializeValidationError(data, typeParam) {
        let keys = Object.keys(data);
        let message = '';
        switch (typeParam) {
            case 'body':
                message = 'Invalid body parameter';
                break;
            case 'query':
                message = 'Invalid query parameter';
                break;
            default:
                message = '';
        }
        return {
            source: {
                parameter: keys[0]
            },
            code: message.replace(/ /g, '_').toLowerCase(),
            title: message,
            detail: data[keys[0]],
            status: 400
        };
    }

    static serializeValidationBodyErrors(data) {
        const errors = [];
        if (data) {
            for (let i = 0, length = data.length; i < length; i++) {
                errors.push(ErrorSerializer.serializeValidationError(data[i], 'body'));
            }
        }
        return {
            errors
        };
    }

    static serializeError(status, message) {
        return {
            errors: [{
                status: status,
                detail: message
            }]
        };
    }
}

module.exports = ErrorSerializer;
