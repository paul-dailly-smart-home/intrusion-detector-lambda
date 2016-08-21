const UUID = require('node-uuid');
const dbConnection = require('../database').createDbConnection();

const INTRUSION_DETECTED_EVENTS_TABLE = 'IntrusionDetectedEvents';

const _createEvent = (property)=> {
    return {
        tenantId: {
            S: property.tenantId
        },
        propertyId: {
            S: property.propertyId
        },
        eventId: {S: UUID.v4()},
        eventType: {S:'INTRUSION_DETECTED'},
        timestamp: {N: `${new Date().getTime()}`}
    };
};

exports.publish = (property) => {
    const event = _createEvent(property);

    return new Promise((resolve, reject)=> {
        dbConnection.putItem({TableName: INTRUSION_DETECTED_EVENTS_TABLE, Item: event}, (err, data) => {
            if (err) {
                return reject(err);
            }

            return resolve(data);
        });
    });
};