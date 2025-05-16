const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { decryptValue } = require('../modules/api/utils/appHelper');
const {setCache} = require('../helpers/cacheHelper');

const integrationConfigSchema = mongoose.Schema({
    api_service: {
        type: String,
        unique: true,
        trim: true,
        required: true,
    },
    credentials: {
        type: Object,
        required: true,
    },
    password: {
        type: String,
        unique: true,
        trim: true,
        required: true,
    },
    is_active: {
        type: Boolean,
        default: true,
    },
},
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

integrationConfigSchema.plugin(toJSON);
integrationConfigSchema.plugin(paginate);

/**
 * @typedef integrationConfigModel
 */
// const integrationConfigModel = mongoose.model('integration_configs', integrationConfigSchema);

async function getIntegartionConfiguration(db) {
    return ''
    let type = ''
    const integrationConfigModel = db.model('integration_configs', integrationConfigSchema);
    let config = await integrationConfigModel.findOne({ api_service: type, is_active: true });
    if (!config) {
        return {};
    }
    const password = config['password'] ? decryptValue(config['password']) : '';
    config['password'] = password;
    config['credentials']['password'] = password;
    setCache(`${type}_configuration`, config, 7200);
    return config;
}

module.exports = { getIntegartionConfiguration };
