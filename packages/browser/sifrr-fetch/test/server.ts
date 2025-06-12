import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { getCliArg } from '@sifrr/test-suite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(getCliArg('port') ?? '6006');

// Serve static files from multiple directories
app.use(express.json());
app.use('/', express.static(path.join(__dirname, '../dist')));
app.use('/', express.static(path.join(__dirname, 'public')));

app.get('/get', (req, res) => {
  res.send('ok');
});

app.get('/get-json', (req, res) => {
  res.json({ ok: 'ok' });
});

app.post('/post', (req, res) => {
  if (req.body) res.set('content-type', 'application/json');
  res.send(req.body);
});

app.put('/put', (req, res) => {
  if (req.body) res.set('content-type', 'application/json');
  res.send(req.body);
});

app.delete('/delete/:id', (req, res) => {
  if (req.params.id === '1') {
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
