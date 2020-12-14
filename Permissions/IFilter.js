const { Client } = require('wolf.js');
const Command = require('../Command');
const CommandContext = require('../CommandContext');

module.exports = class IFilter {
    
    /**
     * Function that is checked, to be overrode
     * @param {Client} client 
     * @param {Command} command 
     * @param {Context} context 
     */
    Validate = async (client, command, context) => {
        return false;
    }
}