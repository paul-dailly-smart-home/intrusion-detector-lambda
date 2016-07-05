const expect = require('chai').expect;
const dynamoEventSource = require('./dynamoDbEventSource');
const awsMock = require('aws-sdk-mock');
const sinon = require('sinon');
const uuid = require('node-uuid');
const uniqueId = 'uniqueId';
const now = new Date().getTime();
var fakeClock;
var sandbox;

describe('DynamoDb motion detected events processing', ()=> {
  beforeEach(() => {
    fakeClock = sinon.useFakeTimers(now);
    sandbox = sinon.sandbox.create();
    sandbox.stub(uuid, 'v4', ()=> uniqueId);

  });

  afterEach(()=> {
    sandbox.restore();
    fakeClock.restore();
  });

  it('ignores all other dynamo events except INSERT', (done)=>{
    const dynamoEvent = _createDynamoDbEventRecord('NOT_INSERT');
    dynamoEventSource.motionEventConsumer({"Records": [dynamoEvent]}, null, (err)=> {
      expect(err.message).to.eql('DynamoDb event not of type INSERT');
      done();
    });
  });

  it('creates an intrusion entry if one does not already exist', (done) => {
    awsMock.mock('DynamoDB', 'putItem', (data, cb) => {console.log('mock called');cb(data.Item);});
    var expectedIntrusionEntry = {
      id: {S: uniqueId},
      tenantId: {S: "tenant1"},
      propertyId: {S: "home1"},
      zoneId: {S: "zone1"},
      sensorId: {S: "motionSensor1"},
      createdTimestamp: {N: `${now}`},
      acknowledgedTimestamp: {N: `${now}`},
      lastFlaggedTimestamp: {N: `${now}`},
      status: {S: "UNACKNOWLEDGED"}
    };

    const dynamoEvent = _createDynamoDbEventRecord('INSERT');

    dynamoEventSource.motionEventConsumer({"Records": [dynamoEvent]}, null, (insertedItem)=> {
      expect(insertedItem).to.eql(expectedIntrusionEntry);
      awsMock.restore();
      done();
    });
  });
  
  // it('creates UNACKNOWLEDGED_INTRUSION_EVENT when intrusion last flagged time greater than configured period', ()=>{});
  //
  // it('updates last flagged timestamp of intrusion entry having created UNACKNOWLEDGED_INTRUSION_EVENT', ()=>{});
  //
  // it('handles multiple motion detected events in single invocation', ()=>{});

});


const _createDynamoDbEventRecord = (eventName) => {
  return {
    "eventID": "5e33be5c18d151fef734151b5235c245",
    "eventName": eventName,
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
              "S": "tenant1"
            },
            "zoneId": {
              "S": "zone1"
            },
            "eventType": {
              "S": "MOTION_DETECTED"
            },
            "propertyId": {
              "S": "home1"
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
