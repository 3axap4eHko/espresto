'use strict';

import { Transform } from 'stream';
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

const placeholderParseRegexp = /(:([a-zA-Z0-9_-]+)(\(.*?\))?)/;
const placeholderRegexp = regexp(placeholderParseRegexp, 'g');
const defaultConstraint = '(.*?)';

function headersPrepare(headers = []) {
  return headers.map( ([name, expr]) => [name, regexp(`/^${expr}$`)]);
}

function buildRoute({ path = requiredArgument('path'), action = requiredArgument('action'), method = 'GET', headers = [], defaults = {}, priority = 10 }) {
  const {pattern, names, placeholders} = (path.match(placeholderRegexp) || []).reduce((result, placeholderData, idx) => {
    const [, , name, constraint = defaultConstraint] = placeholderData.match(placeholderParseRegexp);
    const replacer = name + constraint;

    const placeholder = {
      idx,
      name,
      constraint,
      byDefault: defaults[name]
    };

    return {
      pattern: path.replace(replacer, constraint),
      names: { ...result.names, [name]: idx },
      placeholders: [...result.placeholders, placeholder],
    };
  }, {
    pattern: path,
    names: {},
    placeholders: [],
  });

  return {
    path,
    pattern: regexp(pattern),
    names,
    placeholders,
    method: regexp(`/^${maskToRegexp(method)}$/`,'i'),
    headers: headersPrepare(headers),
    defaults,
    priority,
    action,
  };
}

function pathJoin(pathA, pathB) {
  return pathA.replace(/[/]*&/, '') + '/' + pathB.replace(/^[/]*/, '');
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
  if (!route.pattern.test(request.uri.path)) {
    return false;
  }
  if (!route.method.test(request.method)) {
    return false;
  }
  if (!route.headers.every(([name, expr]) => expr.test(request.headers[name]))) {
    return false;
  }
  return true;
}

function parse(request, route) {

}

function prioritize({ priorityA = 10 }, { priorityB = 10 }) {
  return priorityA - priorityB;
}

class Router extends Transform {
  constructor({ routes, ...options }) {
    super(options);
    this[_routes] = [];
    this[_changed] = false;
  }

  addRule(rule) {
    this[_routes] = this[_routes].concat(getRoutes(rule));
    this[_changed] = true;

    return this;
  }

  _transform(request, enc, next) {

    if (this[_changed]) {
      this[_routes] = this[_routes].sort(prioritize);
      this[_changed] = false;
    }
    console.log(this[_routes]);
    process.exit(0);
    const matched = this[_routes].find(route => match(request, route));
    new Promise(resolve => {
      const data = parse(request, matched);
      resolve(matched.action(data));
    }).then(result => this.push(result));

    next();
  }
}

export default Router;