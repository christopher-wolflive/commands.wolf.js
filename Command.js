const { Client } = require('wolf.js');

module.exports = class Command {
    Trigger;
    Type;
    Method;
    Filters;
    Subcommands

    /**
     * @param {string | RegExp} trigger
     * @param {{ method?: (client: Client, context: CommandContext) => {}, filters?: any[] }} config
     * @param {...Command} commands
     */
    constructor(trigger, config, ...commands) {
        this.Trigger = trigger ?? null;
        this.Type = trigger.constructor.name ?? null;
        this.Method = config?.method ?? null;
        this.Filters = config?.filters ?? [];
        this.Subcommands = commands;
    }
}