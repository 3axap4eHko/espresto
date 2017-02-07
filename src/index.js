import Logger from 'morgan';

import Request from 'ex-stream/Request';

import DI from './DI';
import Config from './Config';

function App() {
  const config = Config();

  const middleware = config.middleware;
  const servicesConfig = config.services;

  const di = DI.fromConfig(servicesConfig);
  di.set('di', di, {});
  di.set('config', config, {});

  const server = di.get('server');
  const router = di.get('router');

  server((req, res) => {
    Request
      .request(req)
      .pipe(di.get('dispatcher'))
      .pipe(di.get('render')(res));

  }, () => {
    const {protocol, hostname, port} = config.server;
    console.log(`Server running at ${protocol}://${hostname}:${port}/`);
  });
}


export default App;