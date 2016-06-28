exports.motionEventConsumer =  (event, context, callback) => {
  // verify passing in AWS keys + environment from command line allows for deploy to work
  // write basic unit test using https://blog.risingstack.com/node-hero-node-js-unit-testing-tutorial/
  // Push to Github and link with Travis
  // Setup Travis config which has 2 builds - 1 sets env to dev the other to prod
  // Store AWS credentials in Travis UI
  // Use dev/prod variables + AWS credentials as flags passed to the deploy task of node-lambda
  // Log to Kibana from lambda

  console.log('Received a new Kinesis event:', JSON.stringify(event, null, 2));
  var decodedEvents = event.Records.map((record) => {
    // Kinesis data is base64 encoded so decode here
    var payload = new Buffer(record.kinesis.data, 'base64').toString('ascii');
    console.log('Decoded payload:', payload);
    return JSON.parse(payload);
  });

  callback(null, decodedEvents);
};