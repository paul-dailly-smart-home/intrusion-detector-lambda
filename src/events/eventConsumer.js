const motionEventService = require('../motion/motionEventService');
const propertyAlarmService = require('../property/propertyAlarmService');

const eventHandlers = new Map([
  ['MOTION_DETECTED', motionEventService.handleEvent],
  ['ALARM_ENABLED', propertyAlarmService.handleAlarmEnabledEvent],
  ['ALARM_DISABLED', propertyAlarmService.handleAlarmDisabledEvent]
]);

const _getHandlerForEventType = (eventType) => {
  return eventHandlers.get(eventType);
};

exports.consume = (eventRecord, context, callback) => {
  console.log(`Consume called with ${JSON.stringify(eventRecord)}`);
  return eventRecord.Records.forEach((record) => {
    if (record.eventName !== 'INSERT') {
      return callback();
    }
    var event = record.dynamodb.NewImage.event.M;
    _getHandlerForEventType(event.eventType.S)(event)
      .then(()=> {
        return callback(null);
      })
      .catch((err) => {
        console.log(err);
        return callback(err);
      });
  });


};