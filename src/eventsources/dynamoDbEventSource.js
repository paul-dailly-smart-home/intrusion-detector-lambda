exports.motionEventConsumer = (event, context) => {

  event.Records.forEach((record) => {
    if (record.eventName !== 'INSERT') {
      return;
    }
    var eventDecoded = new Buffer(record.dynamodb.NewImage.event_raw.B, 'base64').toString('ascii');
    var eventId = record.dynamodb.NewImage.eventId.S;
    console.log(`DynamoDB motion detected event with id ${eventId} and payload ${eventDecoded}`);
  });

};