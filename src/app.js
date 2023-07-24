const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const yargs = require('yargs');
const https = require('https');
const http = require('http');

const app = express();

// Generate random keys
function generateKey() {
  return crypto.randomBytes(12).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substr(0, 6);
}

const uploadKey = generateKey();
const downloadKey = generateKey();

console.log(`Upload Key: ${uploadKey}`);
console.log(`Download Key: ${downloadKey}`);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'files/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// Ensure files directory exists
if (!fs.existsSync('files')) {
  fs.mkdirSync('files');
}

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  console.log(req.body.key, uploadKey)
  if (req.body.key !== uploadKey) {
    return res.status(403).send('Invalid upload key');
  }
  res.send('File uploaded successfully');
});

// Download endpoint
app.get('/files/:downloadKey/:filename', (req, res) => {
  console.log(req.params)
  if (req.params.downloadKey !== downloadKey) {
    return res.status(403).send('Invalid download key');
  }
  res.download(`files/${req.params.filename}`);
});

const argv = yargs
  .option('port', {
    alias: 'p',
    description: 'Set the port',
    type: 'number',
    default: 3000
  })
  .option('host', {
    alias: 'h',
    description: 'Set the host',
    type: 'string',
    default: 'localhost'
  })
  .option('enable-https', {
    description: 'Enable HTTPS',
    type: 'boolean',
    default: false
  })
  .option('private-key', {
    description: 'Path to private key for HTTPS',
    type: 'string',
  })
  .option('public-key', {
    description: 'Path to public key for HTTPS',
    type: 'string',
  })
  .demandCommand(0)
  .help()
  .argv;

if (argv.enableHttps && (!argv.privateKey || !argv.publicKey)) {
  console.error('You must provide paths to both private and public keys when enabling HTTPS.');
  process.exit(1);
}

if (argv.enableHttps) {
  const privateKey = fs.readFileSync(argv.privateKey, 'utf8');
  const certificate = fs.readFileSync(argv.publicKey, 'utf8');
  const credentials = { key: privateKey, cert: certificate };
  const httpsServer = https.createServer(credentials, app);
  httpsServer.listen(argv.port, argv.host, () => {
    console.log(`HTTPS Server started on https://${argv.host}:${argv.port}`);
  });
} else {
  app.listen(argv.port, argv.host, () => {
    console.log(`Server started on http://${argv.host}:${argv.port}`);
  });
}