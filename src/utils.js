'use strict';

export const requiredArgument = name => {throw new Error(`Missed required argument ${name}`)};

export const maskToRegexp = mask => mask.replace(/[-[\]{}().,\\^$|#\s]/g, '\\$&').replace(/([*+?])/g,'.$1');

export const regexp = (...args) => new RegExp(...args);