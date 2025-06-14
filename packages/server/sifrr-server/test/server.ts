import { SifrrServer, UploadedFile } from '@/index';
import { writeHeaders } from '@/server/utils';
import path from 'path';
import { Writable } from 'stream';
import { buffer } from 'stream/consumers';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = new SifrrServer();
const port = parseInt(process.env.PORT ?? '6006');

// Serve static files from multiple directories
app.folder('/fetch', path.join(__dirname, '../../../browser/sifrr-fetch/dist'));
app.folder('/', path.join(__dirname, 'public'), {
  compress: true
});

app.get('/get', (req, res) => {
  res.json(req.query);
});

app.get('/get-json', (req, res) => {
  res.json({ ok: 'ok' });
});

app.post('/post', async (req, res) => {
  const body = await res.body;
  try {
    await res.bodyBuffer;
  } catch (e) {
    res.json({ body, bodyBuffer: (e as Error).message });
  }
});

app.post('/post-stream', async (req, res) => {
  const stream = await buffer(res.bodyStream);
  try {
    await res.body;
  } catch (e) {
    res.json({ stream, body: (e as Error).message });
  }
});

app.post('/post-buffer', async (req, res) => {
  const bodyBuffer = await res.bodyBuffer;
  try {
    await res.body;
  } catch (e) {
    res.json({ bodyBuffer, body: (e as Error).message });
  }
});

app.put('/put', async (req, res) => {
  res.json({ body: await res.body });
});

app.patch('/patch', async (req, res) => {
  res.json({ body: await res.body });
});

app.delete<'id'>('/delete/:id', (req, res) => {
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

app.file('/random/:pattern', path.join(__dirname, 'public/static.html'), {
  headers
});

app.options('/*', (req, res) => {
  writeHeaders(res, headers);
  writeHeaders(res, 'access-control-allow-headers', 'content-type');
  res.end();
});

app.get('/empty', (req, res) => {
  res.end();
});

app.post('/buffer', async (req, res) => {
  writeHeaders(res, headers);
  const body = await res.body;
  res.json(body);
});

app.post(
  '/stream',
  async (req, res) => {
    writeHeaders(res, headers);
    const body = await res.body;
    res.json(body);
  },
  {
    handleFileStream: ({ stream }) => {
      stream.pipe(new Writable());
    }
  }
);

app.post<{
  file: UploadedFile;
  file2: UploadedFile[];
}>(
  '/tmpdir-0',
  async (req, res) => {
    writeHeaders(res, headers);
    res.writeHeader('content-type', 'application/json');
    res.json(await res.body);
  },
  {
    destinationDir: path.join(__dirname, './tmp'),
    fields: {
      file: {
        maxCount: 1
      },
      file2: {
        maxCount: 0
      }
    }
  }
);

app.post<{
  file: UploadedFile;
  file2: UploadedFile[];
}>(
  '/tmpdir-1',
  async (req, res) => {
    writeHeaders(res, headers);
    res.json(await res.body);
  },
  {
    destinationDir: path.join(__dirname, './tmp'),
    fields: {
      file: {
        maxCount: 1
      },
      file2: {
        maxCount: 1
      }
    }
  }
);

app.post<{
  file: UploadedFile;
  file2: UploadedFile[];
}>(
  '/tmpdir',
  async (req, res) => {
    writeHeaders(res, headers);
    res.json(await res.body);
  },
  {
    destinationDir: path.join(__dirname, './tmp'),
    fields: {
      file: {
        maxCount: 1
      },
      file2: {
        maxCount: 5
      }
    }
  }
);

// middleware
app.use((req, res) => {
  if (req.getMethod() === 'get' && req.getUrl() === '/middleware') {
    res.json({ ok: 'middleware' });
    return true;
  }
  return false;
});

// Start the server
app.listen(port, (list) => {
  if (list) console.log(`Server listening on port ${list}`);
  else console.error('Error in listening on port', port);
});

export default app;
