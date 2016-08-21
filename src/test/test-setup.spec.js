const chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
const localDb = require('./localDatabase');

before(function () {
  chai.use(chaiAsPromised);
});

beforeEach(function () {
  return localDb.deleteDatabaseFileDirectory()
    .then(localDb.createDatabaseFileDirectory)
    .then(localDb.launchDatabase);
});

afterEach(function () {
  return localDb.shutdownDatabase();
});