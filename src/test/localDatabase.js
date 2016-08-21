const databaseConnection = require('../database');
const localDynamo = require('local-dynamo');
const fs = require('fs');
const rimraf = require('rimraf');

const DATABASE_FILES_DIRECTORY = '/tmp/intrusion-service-lambda';
var dynamoProcess;
var dbConnection;

const createDatabaseFileDirectory = () => {

  return new Promise((resolve, reject)=> {
    fs.mkdir(DATABASE_FILES_DIRECTORY, (err) => {
      if (err) {
        return reject(err);
      }

      return resolve();
    });
  });
};
const deleteDatabaseFileDirectory = () => {

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
const createDatabaseTable = (collectionDefinition) => {
  return new Promise((resolve, reject) => {
    dbConnection.createTable(collectionDefinition, (err, data) => {
      if (err) {
        return reject(err);
      }

      return resolve(data);
    });
  });
};
const launchDatabase = ()=> {
  return new Promise((resolve)=> {
    dynamoProcess = localDynamo.launch(DATABASE_FILES_DIRECTORY, databaseConnection.DB_PORT);
    dbConnection = databaseConnection.createDbConnection();
    resolve();
  });
};

const retrieveTableItem = (queryCriteria, tableName)=> {
  const queryParams = {
    Key: queryCriteria,
    TableName: tableName
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

const createTableItem = (item, tableName) => {
  return new Promise((resolve, reject)=> {
    dbConnection.putItem({TableName: tableName, Item: item}, (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
};

const shutdownDatabase = ()=>{
  dynamoProcess.kill('SIGINT');
  return deleteDatabaseFileDirectory();
};

module.exports = {
  createDatabaseFileDirectory,
  deleteDatabaseFileDirectory,
  createDatabaseTable,
  launchDatabase,
  retrieveTableItem,
  createTableItem,
  shutdownDatabase
};