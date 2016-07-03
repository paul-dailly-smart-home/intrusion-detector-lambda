var motionDetectedEvent = {
  "eventId": "event1",
  "tenantId": "tenant1",
  "propertyId": "home1",
  "zoneId": "zone1",
  "sensorId": "motionSensor1",
  "eventType": "MOTION_DETECTED",
  "timestamp": "1467554109857"
};
var encodedMotionDetectedEvent = new Buffer(JSON.stringify(motionDetectedEvent)).toString('base64');

var dynamoDbRecord = {
  "eventID": "2eddd37f8c3189ac070803b466742333",
  "eventName": "INSERT",
  "eventVersion": "1.1",
  "eventSource": "aws:dynamodb",
  "awsRegion": "eu-west-1",
  "dynamodb": {
    "ApproximateCreationDateTime": 1467501900,
    "Keys": {
      "eventId": {
        "S": "event1"
      }
    },
    "NewImage": {
      "eventId": {
        "S": "event1"
      },
      "event_raw": {
        "B": encodedMotionDetectedEvent
      }
    },
    "SequenceNumber": "855700000000007800281582",
    "SizeBytes": 215,
    "StreamViewType": "NEW_IMAGE"
  },
  "eventSourceARN": "arn:aws:dynamodb:eu-west-1:810905322061:table/MotionDetectedEvents/stream/2016-07-02T18:20:00.773"
};