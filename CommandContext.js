const { Client, Message, GroupMessage, User, Group } = require('wolf.js');

module.exports = class CommandContext {
    #Commands;
    Client;
    Message;
    User;
    Group;
    Rest;

    /**
     * 
     * @param {{client: Client, message: Message | GroupMessage, user: User, group: Group, rest: string, commands: {Trigger: string, Description: string, Method?: () => void, Filters: []}[], HelpMenuOrder: number}} data 
     */
    constructor(data) {
        this.#Commands = data.commands ?? [];
        this.Client = data.client;
        this.Message = data.message;
        this.User = data.user;
        this.Group = data.group;
        this.Rest = data.rest;
    }

    GenerateHelpObject = (includeFunctionless = false) => {
        let cmds = this.#Commands.filter(t => t.Description);

        if (!includeFunctionless)
            cmds = cmds.filter(t => t.Method);
        
        cmds = cmds.sort((a, b) => a.HelpMenuOrder - b.HelpMenuOrder);
        
        return cmds.map(t => { return { trigger: t.Trigger, description: t.Description } });
    }

    /**
     * @param {string} content 
     */
    Reply = async content => {
        let recipient = this.Message.IsGroup ? this.Message.Recipient : this.Message.Originator;
        return await this.Client.SendMessage(recipient, content, this.Message.IsGroup, 'text/plain');
    }
}