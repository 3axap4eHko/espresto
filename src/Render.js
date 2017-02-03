'use strict';

import {Transform} from 'stream';

const _response = Symbol('Response');
const _render = Symbol('Redner');

class Render extends Transform {
  static render(response, renderer) {
    return new Response(response, renderer);
  }
  constructor(response, renderer) {
    super(response);
    this[_response] = response;
    this[_render] = renderer.bind(null, response);

  }
  _transform(data, enc, next) {
    Promise
      .resolve(data)
      .then(this[_render])
      .then();
  }
}

let currentRenderer = null;

function render(data, options) {

}

render.setRenderer = function (renderer) {

};


export default render;