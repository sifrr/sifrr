import uWS from 'uWebSockets.js';
import BaseApp from './baseapp';
import { extend } from './utils';

class SSLApp extends uWS.SSLApp {
  constructor(options) {
    super(options);
    extend(this, new BaseApp());
  }
}

export default SSLApp;
