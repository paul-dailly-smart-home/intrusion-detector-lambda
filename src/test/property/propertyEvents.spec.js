const eventConsumer = require('../../events/eventConsumer');
const localDb = require('../localDatabase');
require('chai').should();

const PROPERTIES_VIEW_TABLE = 'IntrusionServicePropertiesView';

describe('Property events:', ()=> {

  const createPropertiesViewTable = () => {
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

  const givenPropertyIsNotAlarmed = (property, tenant) => {
    const item = {
      tenantId: tenant,
      propertyId: property
    };

    return givenProperty(item);
  };

  const givenPropertyIsAlarmed = (property, tenant) => {
    const item = {
      tenantId: tenant,
      propertyId: property,
      alarmEnabled: true
    };

    return givenProperty(item);
  };

  const retrieveProperty = ()=> {
    const queryCriteria = {
      tenantId: {
        S: 'tenant1'
      },
      propertyId: {
        S: 'property1'
      }
    };
    return localDb.retrieveTableItem(queryCriteria, PROPERTIES_VIEW_TABLE);
  };

  const runTest = (options) => {
    return new Promise((resolve, reject)=> {
      const eventOptions = options || {};
      const dynamoEvent = _createDynamoRecordForAlarmEnabledEvent(eventOptions);
      eventConsumer.consume({"Records": [dynamoEvent]}, null, (err)=> {
        if (err) {
          return reject(err);
        }

        return resolve();
      });
    });
  };

  beforeEach(() => {
    return createPropertiesViewTable();
  });

  it('Updates property state when alarm enabled event received', ()=> {
    const tenantId = 'tenant1';
    const propertyId = 'property1';
    
    const property = givenPropertyIsNotAlarmed(propertyId, tenantId)
      .then(runTest)
      .then(retrieveProperty);
    
    return property.should.eventually.have.deep.property('alarmEnabled.BOOL', true);
  });

  it('Updates property state when alarm disabled event received', () => {
    const tenantId = 'tenant1';
    const propertyId = 'property1';

    const property = givenPropertyIsAlarmed(propertyId, tenantId)
      .then(runTest.bind(null, {eventType: 'ALARM_DISABLED'}))
      .then(retrieveProperty);

    return property.should.eventually.have.deep.property('alarmEnabled.BOOL', false);
  });
  
});

const _createDynamoRecordForAlarmEnabledEvent = (options) => {
  return {
    "eventID": "5e33be5c18d151fef734151b5235c245",
    "eventName": options.eventName || 'INSERT',
    "eventVersion": "1.1",
    "eventSource": "aws:dynamodb",
    "awsRegion": "eu-west-1",
    "dynamodb": {
      "ApproximateCreationDateTime": 1467557940,
      "Keys": {
        "eventId": {
          "S": "event1"
        }
      },
      "NewImage": {
        "eventId": {
          "S": "event1"
        },
        "event": {
          "M": {
            "eventId": {
              "S": "event1"
            },
            "tenantId": {
              "S": options.tenantId || 'tenant1'
            },
            "eventType": {
              "S": options.eventType || 'ALARM_ENABLED'
            },
            "propertyId": {
              "S": options.propertyId || 'property1'
            },
            "source": {
              "S": "device1"
            },
            "timestamp": {
              "S": "1467554109857"
            }
          }
        }
      },
      "SequenceNumber": "3395600000000009508512985",
      "SizeBytes": 162,
      "StreamViewType": "NEW_IMAGE"
    },
    "eventSourceARN": "arn:aws:dynamodb:eu-west-1:810905322061:table/AlarmEvents/stream/2016-07-02T18:20:00.773"
  };
};