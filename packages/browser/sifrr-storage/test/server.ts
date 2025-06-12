import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { getCliArg } from '@sifrr/test-suite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(getCliArg('port') ?? '6006');

console.log('port to use', port);

// Serve static files from multiple directories
app.use('/', express.static(path.join(__dirname, '../dist')));
app.use('/', express.static(path.join(__dirname, 'public')));

// Define a route for the home page
app.get('/', (_, res) => {
  res.send('Static file server is running!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
