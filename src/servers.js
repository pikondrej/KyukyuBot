/*
 * Server config helper
 **/

import {join as joinPath} from 'path';

import {clientConfig} from './app-config.js';

import {saveJson, readJson, objectToMap}
  from './utils.js';

/**
 * @typedef {import('discord.js')} Discord
 * @typedef {import('./typedef.js').GuildSettings} GuildSettings
 * @typedef {import('./typedef.js').ClientConfig} ClientConfig
 */

/** Server config helper class */
class Servers {
  /** Constructor */
  constructor() {
    const dataPath = clientConfig['client-data-dir'];

    /** @type {string} - Absolute file path for server settings */
    this.filePath = joinPath(dataPath, 'server-config.json');

    /** @type {Map} - Server settings */
    this.data = objectToMap(readJson(this.filePath));
  }

  /**
   * Get a copy of the server settings
   * @param {Discord.Guild} server - Guild (Discord server)
   * @return {GuildSettings}
   */
  getSettings(server) {
    const settings = this.data.get(server.id);
    if (settings) {
      return Object.assign({}, settings);
    } else {
      return {
        'name': server.name,
        'bot-channel': '',
      };
    }
  }

  /**
   * Update server settings
   * @param {Discord.Guild} server - Guild (Discord server)
   * @param {string} key - Setting key
   * @param {string|string[]} value - New value
   */
  updateSettings(server, key, value) {
    const settings = this.getSettings(server);
    settings[key] = value;
    this.data.set(server.id, settings);
    this.saveSettings();
  }

  /**
   * Save server settings
   */
  saveSettings() {
    saveJson(this.data, this.filePath);
  }
}

export const servers = new Servers();
