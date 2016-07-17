const motionEventService = require('../motion/motionEventService');
const eventHandlers = new Map([
    ['MotionDetectedEvents', motionEventService]
]);

const _extractEventSource = (eventSourceARN) => {
    return eventHandlers.get('MotionDetectedEvents');
};

exports.consume = (event, context, callback) => {
    console.log(`Consume called with ${JSON.stringify(event)}`);
    return event.Records.forEach((record) => {
        _extractEventSource(record.eventSourceARN)
            .handleEvent(record.dynamodb.NewImage.event.M)
            .then(()=> {
                return callback(null);
            })
            .catch((err) => {
                return callback(err);
            });
    });


};