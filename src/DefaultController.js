import {Route} from './Router';
import {Response} from './Render';

class DefaultController {
  @Route({path: '/:url(.*)', method: '*', priority: -Infinity})
  notFound({url}) {
    return new Response(`Not found endpoint /${url}`, 404);
  }
}