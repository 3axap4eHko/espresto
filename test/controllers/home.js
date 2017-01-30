'use strict';

export default function HomeController({res, params}) {
  res.end(JSON.stringify(params));
}