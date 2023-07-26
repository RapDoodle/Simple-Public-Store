const path = require('path');

const isFileNameValid = (fileName) => {
  return !(/[^a-zA-Z0-9_\-\. ]/g.test(fileName));
}

function getAbsolutePath(inputPath) {
  if (path.isAbsolute(inputPath)) {
      return inputPath;
  }
  return path.join(process.cwd(), inputPath);
}

module.exports = {
  isFileNameValid,
  getAbsolutePath
}