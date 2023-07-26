const fs = require('fs');
const path = require('path');
const { getAbsolutePath } = require('./file.util');

let configCache;
let dataPath;

/**
 * Load the configuration file into local cache.
 * @param {string} configPath - Path to the .json configuration file.
 */
const loadConfig = (relativeConfigPath) => {
  if (!configCache) {
    const absoluteConfigPath = path.join(process.cwd(), relativeConfigPath);
    try {
      const rawConfig = fs.readFileSync(absoluteConfigPath, 'utf8');
      configCache = JSON.parse(rawConfig);

      // Freeze the object to prevent modifications
      Object.freeze(configCache);
    } catch (error) {
      console.error(`Error loading configuration from ${absoluteConfigPath}:`, error);
      throw error;
    }
  } else {
    console.warn('Configuration is already loaded and cached.');
  }
}

/**
 * Get a configuration entry by key.
 * @param {string} key - Configuration key to retrieve.
 * @returns {any} The configuration value associated with the key, or undefined if the key is not found.
 */
const getConfig = (key) => {
  if (!configCache) {
    console.error('Configuration has not been loaded yet.');
    return undefined;
  }
  return configCache[key];
}

/**
 * Get the path for file storage.
 * @returns {string} The absolute path for storing the files.
 */
const getDataPath = () => {
  if (!dataPath) {
    dataPath = getAbsolutePath(getConfig('dataPath'));
  }
  return dataPath;
}

module.exports = {
  loadConfig,
  getConfig,
  getDataPath
};