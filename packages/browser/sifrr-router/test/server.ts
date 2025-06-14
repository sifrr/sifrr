import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT ?? '6006');

// Serve static files from multiple directories
app.use('/', express.static(path.join(__dirname, '../dist')));
app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/dom', express.static(path.join(__dirname, '../../sifrr-dom/dist')));
app.use('/template', express.static(path.join(__dirname, '../../sifrr-template/dist')));

// Define a route for the home page
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
