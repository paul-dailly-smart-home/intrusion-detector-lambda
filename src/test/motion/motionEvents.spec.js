const eventConsumer = require('../../events/eventConsumer');
const awsMock = require('aws-sdk-mock');
const expect = require('chai').expect;
const sinon = require('sinon');

var sandbox;

describe('Motion events:', ()=> {
    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });

    afterEach(()=> {
        sandbox.restore();
    });

    it('Updates property view to indicate an intrusion for an alarmed property', (done)=> {

        const dynamoEvent = _createDynamoRecordForMotionDetectedEvent('INSERT');
        eventConsumer.consume({"Records": [dynamoEvent]}, null, (err)=> {

            done();
        });
    });

    it('Does not update property view about an intrusion for property with alarm disabled', (done)=> {

        awsMock.mock('DynamoDB', 'getItem', (data, cb) => {
            cb(null, null)
        });
        awsMock.mock('DynamoDB', 'putItem', (data, cb) => {
            throw new Error('DynamoDb.putItem not expected to be called');
        });
        const dynamoEvent = _createDynamoRecordForMotionDetectedEvent('INSERT');
        eventConsumer.consume({"Records": [dynamoEvent]}, null, (err)=> {
            done();
            awsMock.restore();
        });
    });

    it('Returns an error when asked to process motion events for which there is no property', (done)=> {
        awsMock.mock('DynamoDB', 'getItem', (data, cb) => {
            cb(null, null)
        });
        const expectedErrorMessage = 'Property property1 not found for tenant tenant1';
        const expectedErrorCode = 'INTRUSION_SERVICE_UNKNOWN_PROPERTY';
        const dynamoEvent = _createDynamoRecordForMotionDetectedEvent('INSERT');
        eventConsumer.consume({"Records": [dynamoEvent]}, null, (err)=> {

            expect(err.message).to.eql(expectedErrorMessage);
            expect(err.code).to.eql(expectedErrorCode);

            awsMock.restore();
            done();
        });
    });

    it('Creates an intrusion detected event when motion detected at an alarmed property', (done)=> {

        const dynamoEvent = _createDynamoRecordForMotionDetectedEvent('INSERT');
        eventConsumer.consume({"Records": [dynamoEvent]}, null, (err)=> {

            done();
        });
    });

    it('Does not creates an intrusion detected event when motion detected at property with alarm disabled', (done)=> {

        const dynamoEvent = _createDynamoRecordForMotionDetectedEvent('INSERT');
        eventConsumer.consume({"Records": [dynamoEvent]}, null, (err)=> {

            done();
        });
    });

    //TODO: decide whether this test should live here
    it('Only processes INSERT records', (done)=> {

        const dynamoEvent = _createDynamoRecordForMotionDetectedEvent('INSERT');
        eventConsumer.consume({"Records": [dynamoEvent]}, null, (err)=> {

            done();
        });
    });

});

const _createDynamoRecordForMotionDetectedEvent = (eventName) => {
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
                            "S": "property1"
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


