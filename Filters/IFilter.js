const { Client } = require('wolf.js');
const CommandContext = require('../CommandContext');

module.exports = class IFilter {
    FailedMessage = null;

    /**
     * @param {Client} client 
     * @param {CommandContext} context 
     */
    Validate = async (client, context) => {}
}