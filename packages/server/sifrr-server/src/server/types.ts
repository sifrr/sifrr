import { AppOptions, TemplatedApp } from 'uWebSockets.js';

export type UwsApp = {
  (options: AppOptions): TemplatedApp;
  new (options: AppOptions): TemplatedApp;
  prototype: TemplatedApp;
};

export {};
