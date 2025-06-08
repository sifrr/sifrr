import { SifrrServer, UploadedFile } from '@/index';
import { writeHeaders } from '@/server/utils';
import path from 'path';
import { buffer } from 'stream/consumers';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = new SifrrServer();
const port = 6006;

// Serve static files from multiple directories
app.folder('/fetch', path.join(__dirname, '../../../browser/sifrr-fetch/dist'));
app.folder('/', path.join(__dirname, 'public'));

app.get('/get', (res, req) => {
  res.json(req.query);
});

app.get('/get-json', (res, req) => {
  res.json({ ok: 'ok' });
});

app.post('/post', async (res, req) => {
  const body = await res.body;
  try {
    await res.bodyBuffer;
  } catch (e) {
    res.json({ body, bodyBuffer: (e as Error).message });
  }
});

app.post('/post-stream', async (res, req) => {
  const stream = await buffer(res.bodyStream);
  try {
    await res.body;
  } catch (e) {
    res.json({ stream, body: (e as Error).message });
  }
});

app.post('/post-buffer', async (res, req) => {
  const bodyBuffer = await res.bodyBuffer;
  try {
    await res.body;
  } catch (e) {
    res.json({ bodyBuffer, body: (e as Error).message });
  }
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

const headers = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': '*',
  Connection: 'keep-alive'
};

app.folder('', path.join(__dirname, 'public/compress'), {
  headers,
  compress: true
});

app.file('/random/:pattern', path.join(__dirname, 'public/random.html'), {
  headers
});

app.options('/*', (res) => {
  writeHeaders(res, headers);
  writeHeaders(res, 'access-control-allow-headers', 'content-type');
  res.end();
});

app.get('/empty', (res) => {
  res.end();
});

app.post('/buffer', async (res) => {
  writeHeaders(res, headers);
  res.writeHeader('content-type', 'application/json');
  res.json(await res.body);
});

app.post<{
  file?: UploadedFile;
  file2?: UploadedFile[];
}>(
  '/tmpdir',
  async (res) => {
    writeHeaders(res, headers);
    res.writeHeader('content-type', 'application/json');
    const body = await res.body;
    delete (body.file as any).stream;
    res.json(body);
  },
  {
    localDir: path.join(__dirname, './tmp')
  }
);

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
