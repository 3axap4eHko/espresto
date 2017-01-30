'use strict';


export const requiredArgument = name => {throw new Error(`Missed required argument ${name}`)};