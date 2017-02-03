'use strict';

import {requiredArgument} from './utils';

let currentRouter = null;
let currentFactory = null;

function Route({path = requiredArgument('Route.path'), method = 'GET', defaults = {}, headers = [], priority = 10}) {
  return function ({constructor}, key) {
    currentRouter.addRule({
      path,
      method,
      defaults,
      headers,
      priority,
      action(...args) {
        currentFactory(constructor)[key](...args);
      }
    });
  };
}

Route.setRouter = function(router, factory) {
  currentRouter = router;
  currentFactory = factory;
};

export default Route;