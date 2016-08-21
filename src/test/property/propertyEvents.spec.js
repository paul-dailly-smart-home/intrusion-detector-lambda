const eventConsumer = require('../../events/eventConsumer');
const localDb = require('../localDatabase');
require('chai').should();

describe('Alarm events:', ()=> {

  const _createPropertiesViewTable = () => {
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
  
  beforeEach(() => {
    return localDb.deleteDatabaseFileDirectory()
      .then(localDb.createDatabaseFileDirectory)
      .then(localDb.launchDatabase)
      .then(_createPropertiesViewTable)
  });

  afterEach(()=> {
    return localDb.shutdownDatabase();
  });
});

//TODO: Adds entry to alarmed properties view in reaction to property alarm enabled event

//TODO: Removes entry from alarmed properties view in reaction to property alarm disabled event