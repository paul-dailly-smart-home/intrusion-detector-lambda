const AWS = require('aws-sdk');
const DB_HOST = process.env.DYNAMODB_HOST || null;
const DB_PORT = process.env.DYNAMODB_PORT || null;
const DB_REGION = 'eu-west-1';

exports.DB_PORT = DB_PORT;
exports.DB_ENDPOINT = `${DB_HOST}:${DB_PORT}`;
exports.DB_REGION = DB_REGION;

exports.createDbConnection = () => {
    var connectionParams = {
        region: DB_REGION
    };
    
    if(DB_HOST && DB_PORT) {
        connectionParams.endpoint = `${DB_HOST}:${DB_PORT}`;
    }
    console.log('Creating db connection', JSON.stringify(connectionParams));
    return new AWS.DynamoDB(connectionParams);
};