exports.motionEventConsumer =  (event, context) => {

  event.Records.map((record) => {
    // Kinesis data is base64 encoded so decode here
    console.log('DynamoDB motion detected event item: ', JSON.stringify(record));
  });
  
};