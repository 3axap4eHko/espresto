'use strict';

const Path = require('path');
const http = require('http');
const https = require('https');
const Logger = require('morgan');
const Config = require('config');
const Glob = require('glob');
const {Request, Dispatcher} = require('ex-stream').default;

import Router from './Router';
import Route from './Route';

const protocols = {
  http,
  https
};

function App() {
  const {hostname, port, protocol} = Config.get('server');
  const {controllers: controllersDir} = Config.get('directories');
  const currentDir = process.cwd();
  const controllerPath = Path.join(currentDir, controllersDir);
  const router = new Router({routes:[]});

  Route.setRouter(router);
  const controllerList = Glob.sync(`${controllerPath}/**/[A-Z]*.js`).map(require);
  process.exit(0);

  const protocolFactory = protocols[protocol];

  const actions = [];

  const dispatcher = new Dispatcher(actions);

  const server = protocolFactory.createServer((req, res) => {
    Request
      .request(req)
      .pipe(res);
  });

  server.listen(port, hostname, () => {
    console.log(`Server running at ${protocol}://${hostname}:${port}/`);
  });
}


export default App;