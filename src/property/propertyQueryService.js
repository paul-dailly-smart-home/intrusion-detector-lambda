const AWS = require('aws-sdk');

const PROPERTY_INTRUSION_VIEW_TABLE = 'IntrusionServicePropertyView';
const IntrusionServiceError = require('../error/intrusionServiceError');
const PROPERTY_NOT_FOUND_ERROR = 'INTRUSION_SERVICE_UNKNOWN_PROPERTY';
const FIND_PROPERTY_ERROR = 'INTRUSION_SERVICE_DB_ERROR';

const _buildFindQuery = (tenantId, propertyId) => {
    const queryCriteria = {
        tenantId: {
            S: tenantId
        },
        propertyId: {
            S: propertyId
        }
    };
    const queryParams = {
        Key: queryCriteria,
        TableName: PROPERTY_INTRUSION_VIEW_TABLE
    };

    return queryParams;

};

exports.findProperty = (tenantId, propertyId) => {

    return new Promise((resolve, reject)=> {

        const db = new AWS.DynamoDB();
        db.getItem(_buildFindQuery(tenantId, propertyId), (err, data)=> {
            if (err) {
                return reject(new IntrusionServiceError(`Error retrieving property ${propertyId} for tenant ${tenantId}: ${err.message}`, FIND_PROPERTY_ERROR));
            }
            if (!data) {
               return reject(new IntrusionServiceError(`Property ${propertyId} not found for tenant ${tenantId}`, PROPERTY_NOT_FOUND_ERROR));
            }

            const propertyViewItem = data.Item;
            const property = {
                tenantId: propertyViewItem.tenantId.S,
                propertyId: propertyViewItem.propertyId.S,
                alarmEnabled: propertyViewItem.alarmEnabled.BOOL,
                intrusionInProgress: propertyViewItem.intrusionInProgress.BOOL
            };
            
            resolve(property);

        });

    });
};