import Path from 'path';
import http from 'http';
import https from 'https';
import Logger from 'morgan';

import Glob from 'glob';
import {each} from 'yyf-core/iterate';
import Request from 'ex-stream/Request';
import Dispatcher from 'ex-stream/Dispatcher';

import DI from './DI';
import Config from './Config';
import Router from './Router';
import dispatch from './Dispatcher';
import Render from './Render';

import Route from './decorators/Route';
import Service from './decorators/Service';

const protocols = {
  http,
  https
};

function App() {
  const config = Config();
  console.log(config, 'res');
  process.exit();
  const { hostname, port, protocol } = config.server;
  const { controllers: controllersDir } = config.directories;

  const middleware = config.middleware;
  const servicesConfig = config.services;

  const di = new DI();
  di.set('di', di, {});
  di.set('config', config, {});

  each(servicesConfig, ({classOf, factory, instance, args, tags, shared}, name) => {
    if (typeof classOf === 'string') {
      classOf = require(classOf).default;
    }
    if (typeof factory === 'string') {
      factory = require(factory).default;
    }
    if (typeof instance === 'string') {
      instance = require(instance).default;
    }
    di.register(name, {classOf, factory, instance, args, tags, shared});
  });
  const router = di.get('router');

  console.log(router);
  process.exit();
  const currentDir = process.cwd();
  const controllerPath = Path.join(currentDir, controllersDir);
  Glob.sync(`${controllerPath}/**/[A-Z]*.js`).map(require);

  const protocolFactory = protocols[protocol];

  const server = protocolFactory.createServer((req, res) => {

    Request
      .request(req)
      .pipe(dispatch(router))
      .pipe(Render.render(res));
  });

  server.listen(port, hostname, () => {
    console.log(`Server running at ${protocol}://${hostname}:${port}/`);
  });
}


export default App;