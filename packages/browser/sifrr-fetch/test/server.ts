import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 6006;

// Serve static files from multiple directories
app.use(express.json());
app.use('/', express.static(path.join(__dirname, '../dist')));
app.use('/', express.static(path.join(__dirname, 'public')));

app.get('/get', (req, res) => {
  res.send('ok');
});

app.post('/post', (req, res) => {
  res.set('content-type', 'application/json');
  console.log(req.body);
  res.send(req.body);
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
