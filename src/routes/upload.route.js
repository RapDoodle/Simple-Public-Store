const { Router } = require('express');
const { generateRandomKey } = require('../utils/key.util');
const { getConfig, getDataPath } = require('../utils/config.util');
const { saveFile } = require('../services/file.service');

const multer = require('multer');

const uploadKey = generateRandomKey(getConfig('randomUploadKeyLength'));
console.log(`Upload Key: ${uploadKey}`);

const router = Router();

const storage = multer.memoryStorage();
const getUploadMiddleware = (maxSizeMB) => {
  if (!maxSizeMB || !Number.isInteger(maxSizeMB)) {
    maxSizeMB = 0;
  }
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return multer({
    storage: storage,
    limits: {
      fileSize: maxSizeBytes
    }
  }).single('file');
};

// Upload endpoint
router.post('', (req, res, next) => {
  const userMaxSizeMB = getConfig('maxFileSizeInMB');
  console.log(userMaxSizeMB)
  const upload = getUploadMiddleware(userMaxSizeMB);
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).send(`File size exceeds the limit of ${userMaxSizeMB}MB`);
      } else {
        res.status(500).send('An error occurred while uploading the file');
      }
    } else {
      next();
    }
  });
}, async (req, res) => {
  if (req.body.key !== uploadKey) {
    return res.status(403).send('Invalid upload key');
  }
  if (!req.file) {
    return res.status(400).send('No file was sent.');
  }
  try {
    const mapping = await saveFile({
      fileName: req.file.originalname,
      content: req.file.buffer,
      accessLevel: req.body.accessLevel,
      password: req.body.password
    });
    res.send(mapping);
  } catch (err) {
    if (err.errorMessage) {
      return res.status(400).send(err.errorMessage);
    } else {
      console.log(err);
      return res.status(500).send();
    }
  }
});

module.exports = router;