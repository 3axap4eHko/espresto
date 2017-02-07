'use strict';

import { Transform } from 'stream';

export class Response {
  constructor(content = '', code = 200, headers = []) {
    this.content = content;
    this.headers = headers;
    this.code = code;
  }
}

const _response = Symbol('response');
const _content = Symbol('content');

class Renderer extends Transform {
  constructor(response) {
    super({ objectMode: true });
    this[_response] = response;
  }

  _transform(data, enc, next) {
    Promise
      .resolve(data)
      .then(result => {
        if (result instanceof Response) {
          return result;
        }
        return new Response(JSON.stringify(result), 200, [['Content-Type', 'application/json']])
      })
      .then(({ content, headers, code }) => {
        headers.forEach(([name, value]) => {
          this[_response].setHeader(name, value);
        });
        this[_response].statusCode = code;
        this[_content] = content;
        next();
      })
      .catch(error => next(error));
  }
  _flush(next) {
    this[_response].end(this[_content]);
    next();
  }
}

export default function render({ render }) {
  return (response) => {
    return new Renderer(response, render);
  }
}