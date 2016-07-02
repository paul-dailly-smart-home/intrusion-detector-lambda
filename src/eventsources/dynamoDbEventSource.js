exports.motionEventConsumer =  (event, context) => {

  event.Records.map((record) => {
    var eventDecoded = new Buffer(record.dynamoDb.NewImage.event_raw, 'base64').toString('ascii');
    var eventId = record.dynamoDb.NewImage.eventId.S;
    console.log(`DynamoDB motion detected event with id ${eventId} and payload ${eventDecoded}`);
  });
  
};