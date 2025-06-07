import { SifrrServer } from '@/index';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = new SifrrServer();
const port = 6006;

// Serve static files from multiple directories
app.folder('/js', path.join(__dirname, '../dist'));
app.folder('/', path.join(__dirname, 'public'));

app.get('/get', (res, req) => {
  res.json(req.query);
});

app.get('/get-json', (res, req) => {
  res.json({ ok: 'ok' });
});

app.post('/post', async (res, req) => {
  const body = await res.body;
  res.json(body);
});

app.put('/put', async (res, req) => {
  res.json(await res.body);
});

app.delete('/delete/:id', (res, req) => {
  if (req.getParameter('id') === '1') {
    res.writeStatus('200').end();
  } else {
    res.writeStatus('404').end();
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
