import { parse } from 'query-string';
import { HttpRequest } from 'uWebSockets.js';
import { mimetypes, getMimetype } from './server/mime';
import { launchCluster } from './server/cluster';
import { SifrrServer } from '@/server/baseapp';

const getQuery = (req: HttpRequest) => {
  return parse(req.getQuery());
};

export { SifrrServer, mimetypes, getMimetype, launchCluster, getQuery };
export * from './server/types';
