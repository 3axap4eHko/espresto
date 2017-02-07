'use strict';

import { Transform } from 'stream';

const _router = Symbol('Router');

export default class Dispatcher extends Transform {
  constructor(router) {
    super({objectMode: true });
    this[_router] = router;
  }

  _transform(request, enc, next) {
    const {route, params} = this[_router].match(request);
    new Promise(resolve => {
      resolve(route.action(params));
    })
      .catch(error => next(error))
      .then(result => next(null, result));
  }
}