import CompiledPattern from 'uriil/CompiledPattern';
import { requiredArgument, maskToRegexp, regexp } from './utils';

const _routes = Symbol('routes');
const _changed = Symbol('changed');

const defaultRule = {
  path: '/',
  headers: [],
  defaults: {},
  priority: 10,
  routes: []
};

function headersPrepare(headers = []) {
  return headers.map(([name, expr]) => [name, regexp(`/^${expr}$`)]);
}

function buildRoute({ path = requiredArgument('path'), action = requiredArgument('action'), method = 'GET', headers = [], defaults = {}, priority = 10 }) {
  const pattern = CompiledPattern.fromString(path);

  return {
    path,
    pattern,
    method: regexp(`^${maskToRegexp(method)}$`, 'i'),
    headers: headersPrepare(headers),
    defaults,
    priority,
    action,
  };
}

function pathJoin(pathA, pathB) {
  return pathA.replace(/[/]*$/, '') + '/' + pathB.replace(/^[/]*/, '');
}

function mergeRules(ruleA, ruleB) {
  return {
    path: pathJoin(ruleA.path, ruleB.path),
    headers: [...ruleA.headers, ...ruleB.headers],
    defaults: { ...ruleA.defaults, ...ruleB.defaults },
    priority: 10,
    routes: ruleB.routes,
    action: ruleB.action
  };
}

function getRoutes(currentRule = {}, parentRule = defaultRule) {
  const mergedRule = mergeRules(parentRule, currentRule);
  const { routes = [] } = mergedRule;

  if (!routes.length) {
    return [buildRoute(mergedRule)]
  } else {
    return routes.reduce((result, rule) => result.concat(getRoutes(rule, mergedRule)), []);
  }
}

function match(request, route) {
  return route.method.test(request.method) &&
    route.headers.every(([name, expr]) => expr.test(request.headers[name])) &&
    route.compiled.match(request.uri.path);
}

function prioritize({ priorityA = 10 }, { priorityB = 10 }) {
  return priorityA - priorityB;
}

class Router {
  constructor() {
    this[_routes] = [];
    this[_changed] = false;
  }

  addRule(rule) {
    this[_routes] = this[_routes].concat(getRoutes(rule));
    this[_changed] = true;

    return this;
  }

  match(request) {

    if (this[_changed]) {
      this[_routes] = this[_routes].sort(prioritize);
      this[_changed] = false;
    }
    let params = null;
    const route = this[_routes].find(route => params = match(request, route));
    return {
      route,
      params
    };
  }
}

export default Router;