const propertyUpdateService = require('./propertyUpdateService');

const updatePropertyAlarmState = (event, alarmEnabled) => {
  const updatedPropertyState = {
    tenantId: event.tenantId.S,
    propertyId: event.propertyId.S,
    alarmEnabled: alarmEnabled
  };

  return propertyUpdateService.updateProperty(updatedPropertyState);
};

exports.handleAlarmEnabledEvent = (alarmEnabledEvent) => {
  return updatePropertyAlarmState(alarmEnabledEvent, true);
};

exports.handleAlarmDisabledEvent = (alarmDisabledEvent) => {
  return updatePropertyAlarmState(alarmDisabledEvent, false);
};