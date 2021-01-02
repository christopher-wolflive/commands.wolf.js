const { Client, Message } = require('wolf.js');
const Command = require('./Command');

module.exports = class CommandSystem {
    /**
     * @type {Client}
     */
    Client;

    /**
     * @type {Command[]}
     */
    Commands = [];

    /**
     * @type {boolean}
     */
    ProcessOwnMessages;

    /**
     * @param {Client} client 
     * @param {boolean} processOwnMessages
     */
    constructor(client, processOwnMessages = false) {
        this.Client = client;
        this.ProcessOwnMessages = processOwnMessages;

        this.Client.On.SDK.Ready = this.#ClientReady;
    }

    /**
     * Add Commands to the System
     * @param  {...Command} commands 
     */
    AddCommands = (...commands) => {
        this.Commands.push(...commands);
    }

    #ClientReady = () => this.Client.On.Message.Received = this.#Process;

    /**
     * @param {Message} message 
     */
    #Process = async (message) => {
        if (!this.ProcessOwnMessages && message.Originator.Id === this.Client.CurrentUser.Id)
            return;
        
        let cmd = this.Commands
            .sort((a, b) => b.Trigger.length - a.Trigger.length)
            .find(t => message.Content.toLowerCase().trim().startsWith(t.Trigger.toLowerCase().trim()) && t.Method);
        
        if (!cmd)
            return;
        
        cmd.Method(this.Client, message, message.Content.substring(cmd.Trigger.length).trim());
    }
}