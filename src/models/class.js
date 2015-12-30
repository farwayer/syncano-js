import stampit from 'stampit';
import {Meta, Model} from './base';

const ClassMeta = Meta({
  name: 'class',
  pluralName: 'classes',
  endpoints: {
    'detail': {
      'methods': ['delete', 'patch', 'put', 'get'],
      'path': '/v1/instances/{instance}/classes/{name}/'
    },
    'list': {
      'methods': ['post', 'get'],
      'path': '/v1/instances/{instance}/classes/'
    }
  }
});

const Class = stampit()
  .compose(Model)
  .setMeta(ClassMeta);

export default Class;