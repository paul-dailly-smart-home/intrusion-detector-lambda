const eventConsumer = require('../../events/eventConsumer');
const databaseConnection = require('../../database');
const expect = require('chai').expect;
const should = require('chai').should();
const localDynamo = require('local-dynamo');
const fs = require('fs');
const rimraf = require('rimraf');
require('chai-as-promised');

const PROPERTIES_VIEW_TABLE = 'IntrusionServicePropertiesView';
const INTRUSION_DETECTED_EVENTS_TABLE = 'IntrusionDetectedEvents';
const DATABASE_FILES_DIRECTORY = '/tmp/intrusion-service-lambda';

var dynamoProcess;
var dbConnection;

const _createDatabaseFileDirectory = () => {

    return new Promise((resolve, reject)=> {
        fs.mkdir(DATABASE_FILES_DIRECTORY, (err) => {
            if (err) {
                return reject(err);
            }

            return resolve();
        });
    });
};

const _deleteDatabaseFileDirectory = () => {

    return new Promise((resolve, reject)=> {
        fs.exists(DATABASE_FILES_DIRECTORY, (exists) => {
            if (exists) {
                rimraf(DATABASE_FILES_DIRECTORY, (err) => {
                    if (err) {
                        return reject(err);
                    }

                    return resolve();
                });
            } else {
                return resolve();
            }
        });

    });
};

const _createPropertiesView = () => {
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
    return new Promise((resolve, reject) => {
        dbConnection.createTable(tableDefinition, (err, data) => {
            if (err) {
                return reject(err);
            }

            return resolve(data);
        });
    });
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
    return new Promise((resolve, reject) => {
        dbConnection.createTable(tableDefinition, (err, data) => {
            if (err) {
                return reject(err);
            }

            return resolve(data);
        });
    });
};
const _launchDatabase = ()=> {
    return new Promise((resolve)=> {
        dynamoProcess = localDynamo.launch(DATABASE_FILES_DIRECTORY, databaseConnection.DB_PORT);
        dbConnection = databaseConnection.createDbConnection();
        resolve();
    });
};

describe('Motion events:', ()=> {

    beforeEach((done) => {
        _deleteDatabaseFileDirectory()
            .then(_createDatabaseFileDirectory)
            .then(_launchDatabase)
            .then(_createPropertiesView)
            .then(_createIntrusionDetectedEventsTable)
            .then(()=> {
                done()
            })
            .catch((err) => {
                console.log(err);
                done(err);
            });
    });

    afterEach((done)=> {
        dynamoProcess.kill('SIGINT');
        _deleteDatabaseFileDirectory()
            .then(done)
            .catch((err)=> {
                console.log(err);
                done(err);
            });
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
        const queryParams = {
            Key: queryCriteria,
            TableName: INTRUSION_DETECTED_EVENTS_TABLE
        };
        return new Promise((resolve, reject)=> {
            dbConnection.getItem(queryParams, (err, data)=> {
                if (err) {
                    return reject(err);
                }

                return resolve(data.Item);
            });
        });

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
            },
            intrusionDetected: {
                BOOL: property.intrusionDetected || false
            }
        };
        return new Promise((resolve, reject)=> {
            dbConnection.putItem({TableName: PROPERTIES_VIEW_TABLE, Item: item}, (err, data) => {
                if (err) {
                    return reject(err);
                }

                return resolve(data);
            });
        });
    };

    const _givenPropertyIsAlarmed = (property, tenant) => {
        const item = {
            tenantId: tenant,
            propertyId: property,
            alarmEnabled: true,
            intrusionDetected: false
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

    const _givenPropertyAtWhichIntrusionHasBeenDetected = (property, tenant) => {
        const item = {
            tenantId: tenant,
            propertyId: property,
            alarmEnabled: true,
            intrusionDetected: true
        };

        return givenProperty(item);
    };

    it('Creates an intrusion detected event when motion detected at an alarmed property', (done)=> {
        const tenantId = 'tenant1';
        const propertyId = 'property1';
        var runTest = () => {
            return new Promise((resolve, reject)=> {
                const dynamoEvent = _createDynamoRecordForMotionDetectedEvent({});
                eventConsumer.consume({"Records": [dynamoEvent]}, null, (err)=> {
                    if (err) {
                        return reject(err);
                    }

                    return resolve();
                });
            });
        };

        _givenPropertyIsAlarmed(propertyId, tenantId)
            .then(runTest)
            .then(retrieveIntrusionDetectedEvent)
            .should.eventually.have.property('tenantId').to.deep.equal({S: 'tenant1'}).notify(done);
            // .then((intrusionDetectedEvent) => {
            //     console.log(`Intrusion detected event was: ${JSON.stringify(intrusionDetectedEvent)}`);
            //     expect(intrusionDetectedEvent, 'Intrusion detected event not found').to.exist;
            //     expect(intrusionDetectedEvent).to.have.property('tenantId').to.deep.equal({S: 'tenant1'});
            //     expect(intrusionDetectedEvent).to.have.property('propertyId').to.deep.equal({S: 'property1'});
            //     done();
            // })
            // .catch((err)=> {
            //     done(err);
            // });
    });

    it('Does not create an intrusion detected event when motion detected at a property in which an intrusion has already been detected', (done)=> {
        const tenantId = 'tenant1';
        const propertyId = 'property1';
        var runTest = () => {
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
        _givenPropertyAtWhichIntrusionHasBeenDetected(propertyId, tenantId)
            .then(runTest)
            .then(retrieveIntrusionDetectedEvent)
            .then((intrusionDetectedEvent) => {
                expect(intrusionDetectedEvent, 'Intrusion detected event should not be found').to.not.exist;
                done();
            })
            .catch((err)=> {
                done(err);
            });
    });

    it('Does not create an intrusion detected event when motion detected at an un-alarmed property', (done)=> {
        const tenantId = 'tenant1';
        const propertyId = 'property1';
        var runTest = () => {
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
        _givenPropertyIsNotAlarmed(propertyId, tenantId)
            .then(runTest)
            .then(retrieveIntrusionDetectedEvent)
            .then((intrusionDetectedEvent) => {
                expect(intrusionDetectedEvent, 'Intrusion detected event should not be found').to.not.exist;
                done();
            })
            .catch((err)=> {
                done(err);
            });
    });


    it('Does not create an intrusion detected event when motion detected at an unknown property', (done)=> {
        var runTest = () => {
            return new Promise((resolve, reject)=> {
                const dynamoEvent = _createDynamoRecordForMotionDetectedEvent({
                    eventName: 'INSERT',
                    tenantId: 'tenant1',
                    propertyId: 'unknown'
                });
                eventConsumer.consume({"Records": [dynamoEvent]}, null, (err)=> {
                    if (err) {
                        return reject(err);
                    }

                    return resolve();
                });
            });
        };
        runTest()
            .then(retrieveIntrusionDetectedEvent)
            .then(done)
            .catch((err)=> {
                done(err);
            });
    });

// TODO: Becomes creates a new intrusion entry for alarmed property in reaction to intrusion detected event - Different service should react to intrusion detected and update property table
// it('Updates property view to indicate an intrusion for an alarmed property', (done)=> {
//
//     const dynamoEvent = _createDynamoRecordForMotionDetectedEvent('INSERT');
//     eventConsumer.consume({"Records": [dynamoEvent]}, null, (err)=> {
//
//         done();
//     });
// });

//TODO: Updates intrusion entry in reaction to intrusion dismissed / resolved event

//TODO: Adds entry to alarmed properties view in reaction to property alarm enabled event

//TODO: Removes entry from alarmed properties view in reaction to property alarm disabled event

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

const _createDynamoRecordForMotionDetectedEvent = ({eventName = 'INSERT', tenantId = 'tenant1', propertyId = 'property1'} = {}) => {
    console.log(`Creating motion detected event ${eventName} ${tenantId} ${propertyId}`);
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
                            "S": tenantId
                        },
                        "zoneId": {
                            "S": "zone1"
                        },
                        "eventType": {
                            "S": "MOTION_DETECTED"
                        },
                        "propertyId": {
                            "S": propertyId
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


