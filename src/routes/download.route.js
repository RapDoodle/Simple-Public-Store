const path = require('path');
const { Router } = require('express');
const { generateRandomKey } = require('../utils/key.util');
const { getConfig, getDataPath } = require('../utils/config.util');
const { getFile } = require('../services/file.service');

const downloadKey = generateRandomKey(getConfig('randomDownloadKeyLength'));
console.log(`Download Key: ${downloadKey}`);

const router = Router();

// Download endpoint
// router.get('/:downloadKey/:filename', (req, res) => {
//   if (req.params.downloadKey !== downloadKey) {
//     return res.status(403).send('Invalid download key');
//   }
//   res.download(`files/${req.params.filename}`);
// });

router.get('/:fileKey/:fileName', async (req, res) => {
  try {
    const fileMeta = await getFile({
      fileKey: req.params.fileKey,
      fileName: req.params.fileName
    });
    res.download(path.join(getDataPath(), fileMeta.fileKey), fileMeta.fileName);
  } catch (err) {
    if (err.errorMessage) {
      return res.status(400).send('No file was sent.');
    } else {
      console.log(err);
      return res.status(500).send();
    }
  }
});

module.exports = router;