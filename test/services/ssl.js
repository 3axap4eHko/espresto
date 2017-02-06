import {readFileSync} from 'fs';

export default function (key, cert) {
  return {
    key: readFileSync(key, 'utf8'),
    cert: readFileSync(cert, 'utf8'),
  };
}