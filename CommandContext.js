const { Client, Message, GroupMessage, User, Group } = require('wolf.js');
const p = require('path');
const fs = require('fs/promises');
const mime = require('mime-types');

module.exports = class CommandContext {
    Client;
    Translations;
    Language;
    Message;
    User;
    Group;
    Rest;

    /**
     * @param {{client: Client, language: string, translations: any, message: Message | GroupMessage, user: User, group: Group, rest: string}} data 
     */
    constructor(data) {
        this.Client = data.client;
        this.Language = data.language;
        this.Translations = data.translations;
        this.Message = data.message;
        this.User = data.user;
        this.Group = data.group;
        this.Rest = data.rest;
    }

    /**
     * @param {string} key 
     */
    GetTranslation = (key) => {
        if (!this.Language)
            return null;
        
        return this.Translations.find(t => t.key.toLowerCase().trim() === key.toLowerCase().trim())?.translations[this.Language] ?? null;
    }

    /**
     * Send a text response back
     * @param {string} content 
     */
    Reply = async (content) => {
        let trans = this.GetTranslation(content);

        if (trans)
            content = trans;
        
        let recipient = this.Message.IsGroup ? this.Message.Recipient : this.Message.Originator;

        await this.Client.SendMessage(recipient, content, this.Message.IsGroup, 'text/plain');
    }

    /**
     * Reply with an image
     * @param {any} content 
     */
    ReplyImage = async (content, mimeType) => {
        let recipient = this.Message.IsGroup ? this.Message.Recipient : this.Message.Originator;
        return await this.Client.SendMessage(recipient, content, this.Message.IsGroup, mimeType);
    }
}