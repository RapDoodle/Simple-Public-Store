const fs = require('fs');
const path = require('path');
const { Mapping } = require('../models');
const { isFileNameValid } = require('../utils/file.util');
const { getConfig, getDataPath } = require('../utils/config.util');
const { generateRandomKey } = require('../utils/key.util');

const saveFile = async (options) => {
  if (!options.fileName || !isFileNameValid(options.fileName)) {
    throw { errorMessage: 'The filename is empty or invalid.' };
  }
  const fileKey = generateRandomKey(getConfig("randomFileKeyLength"));

  // Store the record in database
  const mapping = Mapping.build({
    fileKey: fileKey,
    fileName: options.fileName
  });
  const dbSavePromise = mapping.save();

  // Save the file to file system
  const fsSavePromise = new Promise((resolve, reject) => {
    fs.writeFile(path.join(getDataPath(), fileKey), options.content, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

  await Promise.all([dbSavePromise, fsSavePromise]);
  return mapping;
}

const getFile = async (options) => {
  if (!options.fileName || !isFileNameValid(options.fileName)) {
    throw { errorMessage: 'The filename is empty or invalid.' };
  }
  if (!options.fileKey) {
    throw { errorMessage: 'The provided file key is not valid' };
  }
  const mapping = await Mapping.findOne({ where: { fileKey: options.fileKey }});
  if (!mapping || mapping.dataValues.fileName !== options.fileName) {
    throw { errorMessage: 'The file key is not valid' };
  }
  return {
    fileKey: mapping.dataValues.fileKey,
    fileName: mapping.dataValues.fileName
  }
}

module.exports = {
  saveFile,
  getFile
}