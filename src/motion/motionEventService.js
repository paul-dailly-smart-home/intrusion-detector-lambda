var propertyQueryService = require('../property/propertyQueryService');
var intrusionEventPublisher = require('./intrusionEventPublisher');

const _publishIntrusionDetectedEventIfPropertyIsAlarmed = (property) => {
        if (property.alarmEnabled) {
            return intrusionEventPublisher.publish(property);
        }
};

exports.handleEvent = (motionDetectedEvent) => {
    return propertyQueryService
        .findProperty(motionDetectedEvent.tenantId.S, motionDetectedEvent.propertyId.S)
        .then(_publishIntrusionDetectedEventIfPropertyIsAlarmed);
};