const IFilter = require('./IFilter');
const { Client } = require('wolf.js');
const Command = require('../Command');
const CommandContext = require('../CommandContext');

module.exports = class GroupOnlyFilter extends IFilter {
    Role;

    /**
     * @param {number} role 
     */
    constructor(role) {
        super();
        this.Role = role;
    }

    /**
     * @param {number} role 
     */
    #Rank = role => {
        if (role === 32)
            return 3;
        if (role === 1)
            return 2;
        if (role === 2)
            return 1;
        if (role === 0)
            return 0;

        return -1;
    }

    /**
     * Function that is checked, to be overrode
     * @param {Client} client 
     * @param {Command} command 
     * @param {CommandContext} context 
     */
    Validate = async (client, command, context) => {
        if (!context.Message.IsGroup)
            return true;
        
        let userRole = context.Message.OriginatorGroupRole;

        if (userRole === -1) {
            let ml = await client.GetGroupMemberList(context.Group.Id);
            userRole = ml.find(t => t.Id === context.User.Id).Capabilities;
        }

        return this.#Rank(userRole) >= this.#Rank(this.Role);
    }
}