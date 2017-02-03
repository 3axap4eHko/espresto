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
import dispatch from './Dispatcher';
import Render from './Render';

const protocols = {
  http,
  https
};

function App(options = {}) {
  const { middlestream } = options;
  const { hostname, port, protocol } = Config.get('server');
  const { controllers: controllersDir } = Config.get('directories');
  const currentDir = process.cwd();
  const controllerPath = Path.join(currentDir, controllersDir);
  const router = new Router({ routes: [] });

  Route.setRouter(router, Constructor => new Constructor());
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