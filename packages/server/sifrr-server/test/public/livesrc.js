import jsCode from '../../src/server/livereloadjs';

const loc = window.location;
let uri;
if (loc.protocol === 'https:') {
  uri = 'wss:';
} else {
  uri = 'ws:';
}
uri += '//' + loc.host + '/livereload';
jsCode(uri);
