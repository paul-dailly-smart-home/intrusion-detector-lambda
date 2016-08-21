const sinon = require('sinon');
const chai = require('chai');
var chaiAsPromised = require("chai-as-promised");

before(function () {
  chai.use(chaiAsPromised);
});

beforeEach(function () {
  this.sandbox = sinon.sandbox.create();
});

afterEach(function () {
  this.sandbox.restore();
});