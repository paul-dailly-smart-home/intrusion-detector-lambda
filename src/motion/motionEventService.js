var propertyQueryService = require('../property/propertyQueryService');

const _doSomethingWithFoundProperty = (property) => {
    console.log(`Found property in which motion is currently being detected ${JSON.stringify(property)}`)
};

exports.handleEvent = (motionDetectedEvent) => {
    return propertyQueryService
        .findProperty(motionDetectedEvent.tenantId.S, motionDetectedEvent.propertyId.S)
        .then(_doSomethingWithFoundProperty);
};