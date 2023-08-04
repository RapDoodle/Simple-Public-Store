const fs = require('fs');
const { getConfig } = require('../utils/config.util');
const { getAbsolutePath } = require('../utils/file.util');
const path = require('path');

const mailboxes = new Map();
const mailboxesConfig = getConfig('mailboxes') || [];
mailboxesConfig.forEach((mailbox, i) => {
  if (!mailbox.name)
    return;
  mailbox.mailboxPath = getAbsolutePath(mailbox.mailboxPath);
  mailboxes.set(mailbox.name, mailbox);
  console.log(`[Mailbox #${i + 1}] ${mailbox.name} (${mailbox.mailboxPath})`);
});

const getMailbox = (mailboxName) => {
  if (!mailboxes.has(mailboxName))
    throw { errorMessage: `Mailbox ${mailboxName} does not exist.` };
  return mailboxes.get(mailboxName);
}

const saveToMailbox = (mailboxName, filename, content) => {
  const mailbox = mailboxes.get(mailboxName);
  if (!mailbox)
    throw { errorMessage: `Mailbox ${mailboxName} does not exist.` };
  // Create the path if not exists
  try {
    if (!fs.existsSync(mailbox.mailboxPath)) {
      fs.mkdirSync(mailbox.mailboxPath);
    }
  } catch (err) {
    console.log(err)
    throw { errorMessage: 'Unable to access the mailbox folder.' }
  }
  const filePath = path.join(mailbox.mailboxPath, filename);
  const fsSavePromise = new Promise((resolve, reject) => {
    fs.writeFile(filePath, content, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
  return Promise.all([fsSavePromise]);
}

module.exports = {
  getMailbox,
  saveToMailbox
}