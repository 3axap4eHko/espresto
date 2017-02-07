import { Transform } from 'stream';

export default class Middleware extends Transform {
  constructor(di) {
    super({objectMode: true});
  }
  _transform() {

  }
  _flush() {

  }
}
