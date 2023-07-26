const crypto = require('crypto');

const randomKeyCharSet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const randomKeyCharSetSize = randomKeyCharSet.length;

const generateRandomKey = (length = 8) => {
  let key = '';
  while (key.length < length) {
    key += randomKeyCharSet[crypto.randomBytes(1)[0] % randomKeyCharSetSize];
  }
  return key;
}

module.exports = {
  generateRandomKey
}