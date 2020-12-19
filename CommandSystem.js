const { Client, Message, Group } = require('wolf.js');
const Command = require('./Command');
const CommandContext = require('./CommandContext');

module.exports = class CommandSystem {
    #Client;
    #Translations;
    #Commands;
    #RegexCommands;
    #StringCommands;
    #ProcessOwnMessages;
    #StaffOverride;
    #FiltersInheritance;

    /**
     * @param {Client} client 
     * @param  {{ ProcessOwnMessages: boolean, StaffOverride: boolean, FilterInheritance: boolean}} config
     */
    constructor(client, config) {
        this.#Client = client;
        this.#Translations = null;
        this.#Commands = [];

        this.#ProcessOwnMessages = config?.ProcessOwnMessages ?? false;
        this.#StaffOverride = config?.StaffOverride ?? false;
        this.#FiltersInheritance = config?.FilterInheritance ?? true;

        this.#Client.On.MessageRecieved = this.#ProcessMessage;
    }

    /**
     * @param {object} translations 
     */
    LoadTranslations = (translations) => {
        this.#Translations = translations;
    }

    /**
     * @param  {...Command} commands
     */
    AddCommands = (...commands) => {
        this.#ProcessCommands(null, ...commands);

        this.#RegexCommands = this.#Commands.filter(t => t.type === 'RegExp');
        this.#StringCommands = this.#Commands.filter(t => t.type === 'String').sort((a, b) => b.trigger.length - a.trigger.length);
    }

    /**
     * @param {string} prefix
     * @param {...Command} commands
     */
    #ProcessCommands = (prefix, ...commands) => {
        commands.forEach(command => {
            // Check Translations
            if (command.Type === 'String' && this.#Translations.map(t => t.key.toLowerCase()).includes(command.Trigger.toLowerCase())) {
                let trans = this.#Translations.find(t => t.key.toLowerCase() === command.Trigger.toLowerCase());

                // Map through each translation and add it as a command
                Object.keys(trans.translations).forEach(lang => {
                    this.#Commands.push({
                        trigger: trans.translations[lang],
                        lang: lang,
                        type: 'String',
                        method: command.Method,
                        filters: command.Filters
                    });

                    if (command.Subcommands.length > 0) {
                        if (this.#FiltersInheritance) {
                            command.Subcommands.map(sc => sc.Filters.push(...command.Filters));
                        }

                        this.#ProcessCommands(prefix ? `${prefix} ${trans.translations[lang]}` : trans.translations[lang], ...command.Subcommands);
                    }
                });

                return;
            }

            if (command.Type === 'RegExp') {
                // https://stackoverflow.com/questions/185510/how-can-i-concatenate-regex-literals-in-javascript
                let flags = command.Trigger.flags.split('').sort().join('').replace(/(.)(?=.*\1)/g, "");
                let cmd = prefix ? `${prefix} ${command.Trigger.source}` : command.Trigger.source;

                this.#Commands.push({
                    trigger: new RegExp(cmd, flags),
                    type: 'RegExp',
                    method: command.Method,
                    filters: command.Filters
                });

                if (command.Subcommands.length > 0) {
                    if (this.#FiltersInheritance) {
                        command.Subcommands.map(sc => sc.Filters.push(...command.Filters));
                    }

                    this.#ProcessCommands(prefix ? `${prefix} ${new RegExp(cmd, flags).source}` : new RegExp(cmd, flags).source, ...command.Subcommands);
                }

                return;
            }

            this.#Commands.push({
                trigger: prefix ? `${prefix} ${command.Trigger}` : command.Trigger,
                type: 'String',
                method: command.Method,
                filters: command.Filters
            });

            if (command.Subcommands.length > 0) {
                if (this.#FiltersInheritance) {
                    command.Subcommands.map(sc => sc.Filters.push(...command.Filters));
                }

                this.#ProcessCommands(prefix ? `${prefix} ${command.Trigger}` : command.Trigger, ...command.Subcommands);
            }
        });
    }

    /**
     * @param {Message} message 
     */
    #ProcessMessage = async message => {
        // Check if Message from Self
        if (this.#Client.CurrentUser.Id === message.Originator && this.#ProcessOwnMessages)
            return;

        let cmd;

        // Check Regex First
        cmd = this.#RegexCommands.find(rc => message.Content.match(rc.trigger));

        // Check String Second
        if (!cmd)
            cmd = this.#StringCommands.sort((a, b) => b.trigger.length - a.trigger.length).find(sc => message.Content.toLowerCase().trim().startsWith(sc.trigger.toLowerCase().trim()));

        if (!cmd || !cmd.method)
            return;
        
        let user = await this.#Client.GetUser(message.Originator);
        let group = new Group([]);

        if (message.IsGroup)
            group = await this.#Client.GetGroup(message.Recipient);
        
        let rest = message.Content;

        if (cmd.type === 'String')
            rest = message.Content.substring(cmd.trigger.length).trim();

        let context = new CommandContext({
            client: this.#Client,
            language: cmd.lang ?? null,
            translations: this.#Translations,
            message: message,
            user,
            group,
            rest
        });
        
        let passed = true;
        let failedMessage = null;

        for (let i = 0; i < cmd.filters.length; i++) {  
            passed = passed && await cmd.filters[i].Validate(this.#Client, context, this.#StaffOverride);

            if (passed)
                continue;
            
            failedMessage = cmd.filters[i].FailedMessage;
            break;
        }

        if (!passed && failedMessage)
            return await context.Reply(failedMessage);
        
        if (!passed)
            return;

        await cmd.method(this.#Client, context);
    }
}