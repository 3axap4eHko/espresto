'use strict';

import {requiredArgument} from './utils';

let currentRouter = null;

function Route({path = requiredArgument('Route.path'), method = 'GET', defaults = {}, headers = [], priority = 10}) {
  return function (Target, key) {
    currentRouter.addRule({path, method, defaults, headers, priority, action: (...args) => (new Target())[key](...args) });
  };
}

Route.setRouter = function(router) {
  currentRouter = router;
};

export default Route;