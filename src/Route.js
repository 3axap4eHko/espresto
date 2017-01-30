'use strict';

import {requiredArgument} from './utils';

let currentRouter = null;

function Route({path = requiredArgument('Route.path'), method = 'GET', defaults = {}, headers = []}) {
  console.log(arguments);
  return function (target, key, description) {
    console.log(arguments);
    console.log(currentRouter);
  };
}

Route.setRouter = function(router) {
  currentRouter = router;
};

export default Route;