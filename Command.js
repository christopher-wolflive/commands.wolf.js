const CommandContext = require('./CommandContext');
const IFilter = require('./Permissions/IFilter');

module.exports = class Command {
    Trigger;
    Description;
    HelpMenuOrder;
    Method;
    Filters;
    SubCommands;

    /**
     * 
     * @param {string} trigger 
     * @param {string} description 
     * @param {{method?: (context: CommandContext) => void, filters?: IFilter[], helpMenuOrder?: number}} config
     * @param {...Command} commands 
     */
    constructor(trigger, description, config, ...commands) {
        this.Trigger = trigger;
        this.Description = description;
        this.SubCommands = commands;
        this.Method = config.method;
        this.Filters = config.filters ?? [];
        this.HelpMenuOrder = config.helpMenuOrder ?? 100;
    }
}