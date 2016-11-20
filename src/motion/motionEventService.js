var propertyQueryService = require('../property/propertyQueryService');
var propertyUpdateService = require('../property/propertyUpdateService');
var intrusionEventPublisher = require('./intrusionEventPublisher');

const _publishIntrusionDetectedEventIfPropertyIsAlarmed = (property) => {
  if (property.alarmEnabled && !property.intrusionInProgress) {
    property.intrusionInProgress = true;
    return propertyUpdateService.updateProperty(property)
      .then(() => {
        intrusionEventPublisher.publish(property)
      });
  }
};

exports.handleEvent = (motionDetectedEvent) => {
  var tenantId = motionDetectedEvent.tenantId.S;
  var propertyId = motionDetectedEvent.propertyId.S;
  return propertyQueryService
    .findProperty(tenantId, propertyId)
    .then(_publishIntrusionDetectedEventIfPropertyIsAlarmed)
};