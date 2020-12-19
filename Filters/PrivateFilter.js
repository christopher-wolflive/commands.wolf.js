const IFilter = require('./IFilter');
const { Client } = require('wolf.js');
const CommandContext = require('../CommandContext');

module.exports = class PrivateFilter extends IFilter {

    constructor() {
        super();
        this.FailedMessage = `(n) Sorry, this command can only be used in private.`;
    }

    /**
     * 
     * @param {Client} client 
     * @param {CommandContext} context 
     */
    Validate = async (client, context) => {
        return !context.Message.IsGroup;
    }
}