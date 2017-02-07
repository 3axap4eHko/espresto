import { isFunction, isNotEmptyString, isStructure } from 'yyf-core/check';
import { toArray } from 'yyf-core/cast';
import { create, defineGetter } from 'yyf-core/reflection';
import { each, filter, first, values, keys } from 'yyf-core/iterate';

function getInstance(service, args) {
  if (isFunction(service.factory)) {
    return service.factory(...args);
  }
  if (isFunction(service.classOf)) {
    return create(service.classOf, args);
  }
  throw new Error(`Cannot create instance for '${service.name}'`);
}

const _Services = Symbol('services');

class DI {
  constructor() {
    this[_Services] = {};
  }

  static fromConfig(servicesConfig) {
    const di = new DI();
    each(servicesConfig, ({ classOf, factory, instance, args, tags, shared }, name) => {
      if (typeof classOf === 'string') {
        classOf = require(classOf).default;
      }
      if (typeof factory === 'string') {
        factory = require(factory).default;
      }
      if (typeof instance === 'string') {
        instance = require(instance).default;
      }
      di.register(name, { classOf, factory, instance, args, tags, shared });
    });
    return di;
  }

  static createService(name, { classOf = null, factory = null, shared = true, instance = null, args = [], tags = [] } = {}) {
    if (!isNotEmptyString(name)) {
      throw new Error(`Service name should be a not empty string but '${name}' given`);
    }
    const properties = {
      name,
      classOf,
      factory,
      shared,
      instance
    };
    if (!isStructure(args)) {
      properties.args = [args];
    } else {
      properties.args = toArray(args || []);
    }
    properties.tags = toArray(tags || []);
    return {
      get name() {
        return properties.name;
      },
      get classOf() {
        return properties.classOf;
      },
      get factory() {
        return properties.factory;
      },
      get args() {
        return properties.args;
      },
      get tags() {
        return properties.tags;
      },
      get shared() {
        return properties.shared;
      },
      set shared(value) {
        properties.shared = value;
      },
      get instance() {
        return properties.instance;
      },
      set instance(value) {
        properties.instance = value;
      }
    };
  }

  proxifyService(target, serviceName) {
    const serviceKey = `$${serviceName}`;
    if (!(serviceKey in target)) {
      defineGetter(target, serviceKey, () => this.get(serviceName));
    }
    return this;
  }

  has(name) {
    return name in this[_Services];
  }

  register(name, options) {
    this.proxifyService(this, name);
    this[_Services][name] = DI.createService(name, options);

    return this[_Services][name];
  }

  set(name, instance, options) {
    const service = DI.createService(name, options);
    service.instance = instance;
    service.shared = true;
    this[_Services][name] = service;
    this.proxifyService(this, name);

    return instance;
  }

  get(name, args) {
    if (!this.has(name)) {
      throw new Error(`Service '${name}' not defined`);
    }
    return this.resolveService(this[_Services][name], args);
  }

  find(callback) {
    return filter(this[_Services], callback);
  }

  findFirst(callback) {
    return first(this[_Services], callback);
  }

  resolveService(service, args) {
    if (service.shared && service.instance) {
      return service.instance;
    }
    const resolvedArgs = values(args || service.args || []).map(this.resolveArg, this);
    const instance = getInstance(service, resolvedArgs);
    if (service.shared) {
      service.instance = instance;
    }
    return instance;
  }

  resolveArg(arg) {
    const serviceArg = (arg || '').toString();
    return !serviceArg.indexOf('$') ? this.get(serviceArg.substr(1)) : arg;
  }

  get services() {
    return keys(this[_Services]);
  }
}

export default DI;
