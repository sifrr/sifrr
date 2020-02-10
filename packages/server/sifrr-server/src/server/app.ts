import uWS from 'uWebSockets.js';
import BaseApp from './baseapp';
import { extend } from './utils';

class App extends uWS.App {
  constructor(options = {}) {
    super(options);
    extend(this, new BaseApp());
  }
}

export default App;
