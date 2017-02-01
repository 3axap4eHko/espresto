'use strict';

import Route from '../../src/Route';

class About {
  @Route({ path: '/' })
  index() {

  }
  @Route({ path: '/about' })
  list() {

  }
  @Route({ path: '/contact' })
  contact() {

  }
  @Route({ path: '/career' })
  career() {

  }
}

export default About;