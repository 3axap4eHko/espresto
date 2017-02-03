import Path from 'path';
import http from 'http';
import https from 'https';
import Logger from 'morgan';
import Config from 'config';
import Glob from 'glob';
import Request from 'ex-stream/Request';
import Dispatcher from 'ex-stream/Dispatcher';

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
  Glob.sync(`${controllerPath}/**/[A-Z]*.js`).map(require);

  const protocolFactory = protocols[protocol];

  const server = protocolFactory.createServer((req, res) => {
    Request
      .request(req)
      .pipe(Dispatcher)
      .on('data', data => {
        console.log(data);
        res.end();
      });
  });

  server.listen(port, hostname, () => {
    console.log(`Server running at ${protocol}://${hostname}:${port}/`);
  });
}


export default App;