const express = require('express');
const fs = require('fs');
const yargs = require('yargs');
const https = require('https');

const argv = yargs
  .option('config', {
    alias: 'c',
    description: 'Configuration',
    type: 'string',
    default: 'default.json'
  })
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

// TODO: Generate a default configuration

// Setup configurations
const { loadConfig, getConfig } = require('./utils/config.util');
loadConfig(argv.config);

// Start loading app components
const uploadRouter = require('./routes/upload.route');
const downloadRouter = require('./routes/download.route');
const { sequelize } = require('./models');

// Setup routes
const app = express();
app.use('/upload', uploadRouter);
app.use('/download', downloadRouter);

// Setup database
sequelize.sync();

// Ensure files directory exists
if (!fs.existsSync('files')) {
  fs.mkdirSync('files');
}

fs.watch('files', (eventType, filename) => {
  console.log(eventType)
  if (filename) {
    console.log(`${filename} was ${eventType}`);
    // Trigger your callback here
  }
});

if (argv.enableHttps) {
  const privateKey = fs.readFileSync(argv.privateKey, 'utf8');
  const certificate = fs.readFileSync(argv.publicKey, 'utf8');
  const credentials = { key: privateKey, cert: certificate };
  const httpsServer = https.createServer(credentials, app);
  httpsServer.listen(argv.port, argv.host, () => {
    console.log(`Server started on https://${argv.host}:${argv.port}`);
  });
} else {
  app.listen(argv.port, argv.host, () => {
    console.log(`Server started on http://${argv.host}:${argv.port}`);
  });
}