var propertyQueryService = require('../property/propertyQueryService');
var intrusionEventPublisher = require('./intrusionEventPublisher');

const _publishIntrusionOneTimeForAlarmedProperty = (property) => {
        console.log(`Found property in which motion is currently being detected ${JSON.stringify(property)}`);
        if (property.alarmEnabled && !property.intrusionDetected) {
            return intrusionEventPublisher.publish(property);
        }
};

exports.handleEvent = (motionDetectedEvent) => {
    return propertyQueryService
        .findProperty(motionDetectedEvent.tenantId.S, motionDetectedEvent.propertyId.S)
        .then(_publishIntrusionOneTimeForAlarmedProperty);
};