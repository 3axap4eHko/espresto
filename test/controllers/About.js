'use strict';

import Route from '../../src/Route';
import Render from '../../src/Render';

class About {
  constructor(...args) {
    console.log(...args)
  }
  @Route({ path: '/' })
  index() {
    return {id: 1};
  }
  @Route({ path: '/about' })
  list() {
    const headers = [];
    return Render({id: 1}, {
      headers: [],
      code: 202,
      message: 'test'
    });
  }
  @Route({ path: '/contact' })
  contact() {

  }
  @Route({ path: '/career/:position' })
  career() {

  }
}

export default About;