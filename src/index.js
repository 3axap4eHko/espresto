import Request from 'ex-stream/Request';

import DI from './DI';
import Config from './Config';

function App() {
  const config = Config();
  const di = DI.fromConfig(config);
  const server = di.get('server');

  server((req, res) => {
    di.get('middleware')
      .pipe(di.get('render')(res))
      .end(new Request(req));
  }, () => {
    const {protocol, hostname, port} = config.server;
    console.log(`Server running at ${protocol}://${hostname}:${port}/`);
  });
}


export default App;