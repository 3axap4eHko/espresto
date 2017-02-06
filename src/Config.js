import {accessSync, readFileSync, constants} from 'fs';
import {join, dirname} from 'path';
import yaml from 'js-yaml';

function fileExists(filename) {
  try {
    accessSync(filename, constants.R_OK);
    return true;
  } catch (e) {
    return false;
  }
}

function loadConfig(filename, schema) {
  const currentDir = process.cwd();
  try {
    process.chdir(dirname(filename));
    return yaml.load(readFileSync(filename, 'utf8'), {schema, filename});
  } finally {
    process.chdir(currentDir);
  }
}

const YamlIncludeFileType = new yaml.Type('tag:yaml.org,2002:include', {
  kind: 'scalar',
  resolve(filename) {
    return fileExists(filename);
  },
  construct(filename) {
    const schema = yaml.Schema.create([ this ]);
    return (typeof filename === 'string') && loadConfig(filename, schema);
  }
});



export default function (root = join(process.cwd(), 'config')) {
  const {NODE_ENV} = process.env;
  const defaultConfigFilename = join(root, 'default.yml');
  const schema = yaml.Schema.create([ YamlIncludeFileType ]);
  const defaultConfig = loadConfig(defaultConfigFilename, schema);
  const environmentConfigFilename = join(root, `${NODE_ENV}.yml`);
  const environmentConfig = loadConfig(environmentConfigFilename, schema);

  return Object.assign(defaultConfig, environmentConfig);
}
