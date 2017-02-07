import http from './protocols/http';
import https from './protocols/https';

const protocolFactories = {
  http,
  https
};

export default function Server({server}) {
  const {protocol, ...options} = server;

  return protocolFactories[protocol](options);
}

export const registerProtocolFactory = function (name, factory) {
  protocolFactories[name] = factory;
};