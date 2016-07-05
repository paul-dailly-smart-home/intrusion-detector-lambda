const AWS = require('aws-sdk');
const uuid = require('node-uuid');
const INTRUSIONS_TABLE = 'Intrusions';
const NOT_INSERT_EVENT_MESSAGE = 'DynamoDb event not of type INSERT';

const _createIntrusionEntry = (motionDetectedEvent) => {
  const intrusionId = uuid.v4();
  var now = `${new Date().getTime()}`;
  return {
    id: {
      S: intrusionId
    },
    tenantId: {
      S: motionDetectedEvent.tenantId.S
    },
    propertyId: {
      S: motionDetectedEvent.propertyId.S
    },
    zoneId: {
      S: motionDetectedEvent.zoneId.S
    },
    sensorId: {
      S: motionDetectedEvent.sensorId.S
    },
    createdTimestamp: {
      N: now
    },
    acknowledgedTimestamp: {
      N: now
    },
    lastFlaggedTimestamp: {
      N: now
    },
    status: {
      S: 'UNACKNOWLEDGED'
    }
  };
};

const _addIntrusionEntryToDynamo = (motionDetectedEvent, callback) => {
  const db = new AWS.DynamoDB();
  const intrusionEntry = _createIntrusionEntry(motionDetectedEvent);
  const params = {
    TableName: INTRUSIONS_TABLE,
    Item: intrusionEntry
  };
  db.putItem(params, callback);
};


exports.motionEventConsumer = (event, context, callback) => {

  event.Records.forEach((record) => {
    if (record.eventName !== 'INSERT') {
      console.log(`Ignoring event record with DynamoDb event type: ${record.eventName}`);
      callback(new Error(NOT_INSERT_EVENT_MESSAGE));
      return;
    }
    // console.log(`Processing event record ${JSON.stringify(record)}`);
    // var eventId = record.dynamodb.NewImage.eventId.S;
    
    // TODO: only insert entry if one does not already exist  
    _addIntrusionEntryToDynamo(record.dynamodb.NewImage.event.M, callback);
  });


};