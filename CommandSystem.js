const { Client, GroupMessage, Message, Group } = require('wolf.js');
const Command = require('./Command');
const CommandContext = require('./CommandContext');

module.exports = class CommandSystem {
    Client;
    Commands;
    #Processed;

    /**
     * @param {Client} client
     * @param {...Command} commands
     */
    constructor(client, ...commands) {
        this.Client = client;
        this.Commands = commands;
        this.#Processed = [];

        commands.forEach(command => this.#ProcessCommand(null, command));

        this.Client.On.GroupMessageRecieved = this.#OnGroupMessage;
        this.Client.On.PrivateMessageRecieved = this.#OnPrivateMessage;
    }

    /**
     * @param  {...Command} commands 
     */
    AddCommands = (...commands) => {
        this.Commands.push(...commands);
        commands.forEach(command => this.#ProcessCommand(null, command));
    }

    /**
     * @param {string} prefix 
     * @param {Command} command 
     */
    #ProcessCommand = (prefix, command, ...filters) => {
        let trigger = prefix ? `${prefix} ${command.Trigger}` : command.Trigger;
        filters = [...command.Filters, ...filters];

        if (command.SubCommands.length > 0)
            command.SubCommands.forEach(subcommand => this.#ProcessCommand(trigger, subcommand, ...filters));
        
        this.#Processed.push({
            Trigger: trigger,
            Description: command.Description,
            Method: command.Method,
            Filters: filters,
            HelpMenuOrder: command.HelpMenuOrder
        });
    }

    //#region Event Handlers
    
    /**
     * @param {GroupMessage} message 
     */
    #OnGroupMessage = async message => {
        let command = this.#Processed.sort((a, b) => b.Trigger.length - a.Trigger.length).find(t => message.Content.toLowerCase().startsWith(t.Trigger.toLowerCase()));

        if (!command)
            return;
        
        let user = await this.Client.GetUser(message.Originator);
        let group = await this.Client.GetGroup(message.Recipient);

        let context = new CommandContext({
            client: this.Client,
            message,
            user,
            group,
            rest: message.Content.substring(command.Trigger.length).trim(),
            commands: this.#Processed
        });

        let validateFilters = await (Promise.all(command.Filters.map(filter => filter.Validate(this.Client, command, context))));
        let passedValidation = validateFilters.reduce((previous, next) => previous &= next, true);

        if (passedValidation && command.Method)
            await command.Method(context);
    }

    /**
     * @param {Message} message 
     */
    #OnPrivateMessage = async message => {
        let command = this.#Processed.sort((a, b) => b.Trigger.length - a.Trigger.length).find(t => message.Content.toLowerCase().startsWith(t.Trigger.toLowerCase()));

        if (!command)
            return;
        
        let user = await this.Client.GetUser(message.Originator);
        
        let context = new CommandContext({
            client: this.Client,
            message,
            user,
            group: new Group([]),
            rest: message.Content.substring(command.Trigger.length).trim(),
            commands: this.#Processed
        });

        let validateFilters = await (Promise.all(command.Filters.map(filter => filter.Validate(this.Client, command, context))));
        let passedValidation = validateFilters.reduce((previous, next) => previous &= next, true);

        if (passedValidation && command.Method)
            await command.Method(context);
    }

    //#endregion
}