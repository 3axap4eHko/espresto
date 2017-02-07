'use strict';

import {Transform} from 'stream';

export class Response {
  constructor(content = '', headers = [], code = 200) {
    this.content = content;
    this.headers = headers;
    this.code = code;
  }
}

const _response = Symbol('response');

class Renderer extends Transform {
  constructor(response) {
    super({objectMode: true});
    this[_response] = response;
  }
  _transform(data, enc, next) {
    Promise
      .resolve(data)
      .then(result => {
        if (result instanceof Response) {
          return result;
        }
        return new Response(JSON.stringify(result))
      })
      .then(({content, headers, code}) => {
        headers.forEach(([name, value]) => {
          this[_response].setHeader(name, value);
        });
        this[_response].statusCode = code;
        next(null, content);
      });
  }
}

export default function render({render}) {
  return (response) => {
    return new Renderer(response, render).pipe(response);
  }
}