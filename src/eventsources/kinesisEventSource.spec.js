const expect = require('chai').expect;
const kinesisEventSource = require('./kinesisEventSource');

describe('Kinesis motion detected event processing', ()=> {

  it('decodes the motion detected events', (done) => {

    const kinesisEvent = createKinesisEvent();

    kinesisEventSource.motionEventConsumer(kinesisEvent, {}, (err, decodedEvents) => {
      expect(decodedEvents.length).to.eql(3);
      expect(decodedEvents[0].cameraId).to.eql('camera3');
      expect(decodedEvents[1].cameraId).to.eql('camera1');
      done();
    });

  });

});

const createKinesisEvent = function () {
  return {
    "Records": [
      {
        "kinesis": {
          "data": "ewogICJjYW1lcmFJZCI6ICJjYW1lcmEzIiwKICAidGVuYW50SWQiOiAidGVuYW50MSIKfQ=="
        }
      },
      {
        "kinesis": {
          "data": "ewogICJjYW1lcmFJZCI6ICJjYW1lcmExIiwKICAidGVuYW50SWQiOiAidGVuYW50MSIKfQ=="
        }
      }
    ]
  };
};