const eventConsumer = require('../../events/eventConsumer');
const localDb = require('../localDatabase');
require('chai').should();

const PROPERTIES_VIEW_TABLE = 'IntrusionServicePropertiesView';
const INTRUSION_DETECTED_EVENTS_TABLE = 'IntrusionDetectedEvents';

const _createPropertiesViewTable = () => {
  const tableDefinition = {
    AttributeDefinitions: [
      {
        AttributeName: 'tenantId',
        AttributeType: 'S'
      },
      {
        AttributeName: 'propertyId',
        AttributeType: 'S'
      }
    ],
    KeySchema: [
      {
        AttributeName: 'tenantId',
        KeyType: 'HASH'
      },
      {
        AttributeName: 'propertyId',
        KeyType: 'RANGE'
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1
    },
    TableName: PROPERTIES_VIEW_TABLE
  };
  return localDb.createDatabaseTable(tableDefinition);
};
const _createIntrusionDetectedEventsTable = () => {
  const tableDefinition = {
    AttributeDefinitions: [
      {
        AttributeName: 'tenantId',
        AttributeType: 'S'
      },
      {
        AttributeName: 'propertyId',
        AttributeType: 'S'
      }
    ],
    KeySchema: [
      {
        AttributeName: 'tenantId',
        KeyType: 'HASH'
      },
      {
        AttributeName: 'propertyId',
        KeyType: 'RANGE'
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1
    },
    TableName: INTRUSION_DETECTED_EVENTS_TABLE
  };
  return localDb.createDatabaseTable(tableDefinition);
};

describe('Motion events:', ()=> {

  beforeEach(() => {
    return localDb.deleteDatabaseFileDirectory()
      .then(localDb.createDatabaseFileDirectory)
      .then(localDb.launchDatabase)
      .then(_createPropertiesViewTable)
      .then(_createIntrusionDetectedEventsTable)
  });

  afterEach(()=> {
    return localDb.shutdownDatabase();
  });

  const retrieveIntrusionDetectedEvent = ()=> {
    const queryCriteria = {
      tenantId: {
        S: 'tenant1'
      },
      propertyId: {
        S: 'property1'
      }
    };
    return localDb.retrieveTableItem(queryCriteria, INTRUSION_DETECTED_EVENTS_TABLE);
  };

  const givenProperty = (property) => {
    const item = {
      tenantId: {
        S: property.tenantId
      },
      propertyId: {
        S: property.propertyId
      },
      alarmEnabled: {
        BOOL: property.alarmEnabled || false
      }
    };
    return localDb.createTableItem(item, PROPERTIES_VIEW_TABLE);
  };

  const _givenPropertyIsAlarmed = (property, tenant) => {
    const item = {
      tenantId: tenant,
      propertyId: property,
      alarmEnabled: true
    };

    return givenProperty(item);
  };

  const _givenPropertyIsNotAlarmed = (property, tenant) => {
    const item = {
      tenantId: tenant,
      propertyId: property
    };

    return givenProperty(item);
  };

  const runTest = () => {
    return new Promise((resolve, reject)=> {
      const dynamoEvent = _createDynamoRecordForMotionDetectedEvent();
      eventConsumer.consume({"Records": [dynamoEvent]}, null, (err)=> {
        if (err) {
          return reject(err);
        }

        return resolve();
      });
    });
  };
  
  it('Creates an intrusion detected event when motion detected at an alarmed property', ()=> {
    const tenantId = 'tenant1';
    const propertyId = 'property1';

    const intrusionDetectedEvent = _givenPropertyIsAlarmed(propertyId, tenantId)
      .then(runTest)
      .then(retrieveIntrusionDetectedEvent);

    return Promise.all([
      intrusionDetectedEvent.should.eventually.have.deep.property('tenantId.S', 'tenant1'),
      intrusionDetectedEvent.should.eventually.have.deep.property('propertyId.S', 'property1')
    ]);
  });

  it('Does not create an intrusion detected event when motion detected at an un-alarmed property', ()=> {
    const tenantId = 'tenant1';
    const propertyId = 'property1';

    const intrusionDetectedEvent = _givenPropertyIsNotAlarmed(propertyId, tenantId)
      .then(runTest)
      .then(retrieveIntrusionDetectedEvent);

    return intrusionDetectedEvent
      .should.eventually.equal(undefined);
  });


  it('Does not create an intrusion detected event when motion detected at an unknown property', ()=> {
    return runTest()
      .then(retrieveIntrusionDetectedEvent)
      .should.be.rejected;
  });


//TODO: decide whether this test should live here
// it('Only processes INSERT records', (done)=> {
//
//     const dynamoEvent = _createDynamoRecordForMotionDetectedEvent('INSERT');
//     eventConsumer.consume({"Records": [dynamoEvent]}, null, (err)=> {
//
//         done();
//     });
// });

})
;

const _createDynamoRecordForMotionDetectedEvent = (eventName, tenantId, propertyId) => {
  return {
    "eventID": "5e33be5c18d151fef734151b5235c245",
    "eventName": eventName || 'INSERT',
    "eventVersion": "1.1",
    "eventSource": "aws:dynamodb",
    "awsRegion": "eu-west-1",
    "dynamodb": {
      "ApproximateCreationDateTime": 1467557940,
      "Keys": {
        "eventId": {
          "S": "event4"
        }
      },
      "NewImage": {
        "eventId": {
          "S": "event4"
        },
        "event": {
          "M": {
            "eventId": {
              "S": "event4"
            },
            "tenantId": {
              "S": tenantId || 'tenant1'
            },
            "zoneId": {
              "S": "zone1"
            },
            "eventType": {
              "S": "MOTION_DETECTED"
            },
            "propertyId": {
              "S": propertyId || 'property1'
            },
            "timestamp": {
              "S": "1467554109857"
            },
            "sensorId": {
              "S": "motionSensor1"
            }
          }
        }
      },
      "SequenceNumber": "3395600000000009508512985",
      "SizeBytes": 162,
      "StreamViewType": "NEW_IMAGE"
    },
    "eventSourceARN": "arn:aws:dynamodb:eu-west-1:810905322061:table/MotionDetectedEvents/stream/2016-07-02T18:20:00.773"
  };
};


