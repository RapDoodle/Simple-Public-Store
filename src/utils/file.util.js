const os = require('os');
const path = require('path');

const isFileNameValid = (fileName) => {
  return !(/[^a-zA-Z0-9_\-\. ]/g.test(fileName));
}

function getAbsolutePath(inputPath) {
  if (inputPath === '~' || inputPath.startsWith('~/')) {
    return path.join(os.homedir(), inputPath.slice(1));
  }
  if (path.isAbsolute(inputPath)) {
    return inputPath;
  }
  return path.join(process.cwd(), inputPath);
}

module.exports = {
  isFileNameValid,
  getAbsolutePath
}