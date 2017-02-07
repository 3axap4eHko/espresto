'use strict';

import { Transform } from 'stream';

const _router = Symbol('Router');
const _action = Symbol('Action');

export default class Dispatcher extends Transform {
  constructor(router) {
    super({ objectMode: true });
    this[_router] = router;
  }

  _transform(request, enc, next) {
    const { route, params } = this[_router].match(request);
    this[_action] = new Promise(resolve => resolve(route.action(params)))
      .then(result => this.push(result))
      .then(() => next())
      .catch((error) => next(error))
  }
}
