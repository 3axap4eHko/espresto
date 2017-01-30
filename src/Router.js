'use strict';

import {Transform} from 'stream';
import {requiredArgument} from './utils';
const _routes = Symbol('routes');

const defaultRule = {
  headers: [],
  defaults: {},
  priority: 10,
  routes: []
};

function buildRoute({path = requiredArgument('path'), method = '', headers = [], defaults = {}, routes = [], priority = 10}) {

}

function pathJoin(pathA, pathB) {
  return pathA.replace(/[/]*&/,'') + '/' + pathB.replace(/^[/]*/,'');
}

function mergeRules(ruleA, ruleB) {
  return {
    path: pathJoin(ruleA.path, ruleB.path),
    headers: [...ruleA.headers, ...ruleB.headers],
    defaults: {...ruleA.defaults, ...ruleB.defaults},
    priority: 10,
    routes: ruleB.routes
  };
}

function getRoutes(currentRule = {}, parentRule = defaultRule){
  const mergedRule = mergeRules(parentRule, currentRule);
  const {routes} = mergedRule;

  if (!routes.length){
    return [buildRoute(mergedRule)]
  } else {
    return routes.reduce( (result, rule) => result.concat(getRoutes(rule, mergedRule)), []);
  }
}

class Router extends Transform {
  constructor({routes, ...options}) {
    super(options);

  }
  addRule(rule) {
    this[_routes].push(getRoutes(rule));

    return this;
  }
  _transform() {

  }
}

export default Router;