const IFilter = require('./IFilter');
const { Client, GroupRole, Privileges } = require('wolf.js');
const CommandContext = require('../CommandContext');

module.exports = class GroupRoleFilter extends IFilter {
    #Role;

    /**
     * @param {string} role 
     * @param {boolean} staffOverride
     */
    constructor(role) {
        super();
        this.#Role = role;
        this.FailedMessage = `(n) Sorry, to use this command you must have the role of ${this.#RoleName(role)} or higher.`;
    }

    /**
     * @param {number} role
     */
    #RoleName = (role) => {
        switch (role) {
            case GroupRole.Owner:
                return 'owner';
            case GroupRole.Admin:
                return 'admin';
            case GroupRole.Mod:
                return 'mod';
            default:
                return 'user';
        }
    }

    /**
     * @param {number} role 
     */
    #RoleRank = (role) => {
        switch (role) {
            case GroupRole.Owner:
                return 3;
            case GroupRole.Admin:
                return 2;
            case GroupRole.Mod:
                return 1;
            case GroupRole.User:
                return 0;
            default:
                return -1;
        }
    }

    /**
     * 
     * @param {Client} client 
     * @param {CommandContext} context 
     */
    Validate = async (client, context, staffOverride) => {
        try {
            if (!context.Message.IsGroup)
                return true;
            
            if (staffOverride && (context.User.Privileges & Privileges.Staff) != 0)
                return true;

            let ml = await client.GetGroupMemberList(context.Group.Id);
            let originatorRole = ml.find(t => t.Id === context.User.Id)?.Capabilities ?? 0;
        
            return this.#RoleRank(originatorRole) >= this.#RoleRank(this.#Role);
        } catch (e) { console.log(e); return false; }
    }
}