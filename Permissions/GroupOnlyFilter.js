const IFilter = require('./IFilter');
const { Client } = require('wolf.js');
const Command = require('../Command');
const CommandContext = require('../CommandContext');

module.exports = class GroupOnlyFilter extends IFilter {
    constructor() { super() }

    /**
     * Function that is checked, to be overrode
     * @param {Client} client 
     * @param {Command} command 
     * @param {CommandContext} context 
     */
    Validate = async (client, command, context) => {
        return context.Message.IsGroup;
    }
}