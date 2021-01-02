const { Client, Message } = require('wolf.js');

module.exports = class Command {
    /**
     * @type {string}
     */
    Trigger;

    /**
     * @type {(client: Client, message: Message, rest: string) => void}
     */
    Method;

    /**
     * 
     * @param {string} trigger 
     * @param {{ method: (client: Client, message: Message, rest: string) => void}} config 
     */
    constructor(trigger, config) {
        this.Trigger = trigger;
        this.Method = config?.method ?? null;
    }
}