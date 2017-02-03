'use strict';

import { Transform } from 'stream';

const _router = Symbol('Router');

class Dispatcher extends Transform {
  static dispatch(router) {
    return new Dispatcher({router});
  }
  constructor({router, ...options }) {
    super({ ...options, objectMode: true });
    this[_router] = router;
  }

  _transform(request, enc, next) {
    const matched = this[_router].match(request);

    new Promise(resolve => {
      resolve(matched.action(matched.params));
    })
      .catch(error => next(error))
      .then(result => next(null, result));
  }
}

export default function dispatch(router) {
  return new Dispatcher({router});
};