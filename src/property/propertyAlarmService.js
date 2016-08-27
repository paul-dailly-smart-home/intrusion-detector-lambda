const propertyUpdateService = require('./propertyUpdateService');

exports.handleAlarmEnabledEvent = (alarmEnabledEvent) => {
  const property = {
    tenantId: alarmEnabledEvent.tenantId.S,
    propertyId: alarmEnabledEvent.propertyId.S,
    alarmEnabled: true
  };
  return propertyUpdateService.updateProperty(property);
};