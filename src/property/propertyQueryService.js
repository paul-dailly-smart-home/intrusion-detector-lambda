const dbConnection = require('../database').createDbConnection();

const PROPERTIES_VIEW_TABLE = 'IntrusionServicePropertiesView';
const IntrusionServiceError = require('../error/intrusionServiceError');
const PROPERTY_RETRIEVAL_ERROR = 'INTRUSION_SERVICE_PROPERTY_NOT_FOUND_ERROR';

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
        TableName: PROPERTIES_VIEW_TABLE
    };

    return queryParams;

};

exports.findProperty = (tenantId, propertyId) => {
    return new Promise((resolve, reject)=> {

        
        dbConnection.getItem(_buildFindQuery(tenantId, propertyId), (err, data)=> {
            if (err) {
                return reject(new IntrusionServiceError(`Error retrieving property ${propertyId} for tenant ${tenantId}: ${err.message}`, PROPERTY_RETRIEVAL_ERROR));
            }
            if (!data || !data.Item) {
                return reject(new IntrusionServiceError(`Could not find property "${propertyId}" for tenant "${tenantId}"`, PROPERTY_RETRIEVAL_ERROR));
            }

            const propertyViewItem = data.Item;
            const property = {
                tenantId: propertyViewItem.tenantId.S,
                propertyId: propertyViewItem.propertyId.S,
                alarmEnabled: propertyViewItem.alarmEnabled.BOOL,
                intrusionInProgress: propertyViewItem.intrusionInProgress.BOOL
            };
            
            return resolve(property);

        });

    });
};
exports.ALARMED_PROPERTIES_VIEW = PROPERTIES_VIEW_TABLE;