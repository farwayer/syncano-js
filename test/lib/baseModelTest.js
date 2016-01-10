import should from 'should/as-function';
import Syncano from '../../src/syncano';
import Instance from '../../src/models/instance';
import {ValidationError} from '../../src/errors';
import nock from 'nock';
import {instanceName, testEndpoint, testBaseUrl, testName} from './utils';

describe('Base model meta', function() {
  let model = null;
  let meta = null;

  beforeEach(function() {
    model = Syncano().Instance({ name: instanceName });
    meta = model.getMeta();
  });

  describe('#resolveEndpointPath()', function() {

    it('is a function of the "meta" property', function() {
      should(meta).have.property('resolveEndpointPath').which.is.Function();
    });

    it('should throw error when endpoint is not found', function() {
      should(function() {
        meta.resolveEndpointPath(testEndpoint, model);
      }).throw(Error(`Invalid endpoit name: ${testEndpoint}.`));
    });

    it('should throw error when path properties are missing', function() {
      should(function() {
        meta.resolveEndpointPath('detail', null);
      }).throw(Error('Missing "detail" path properties "name"'))
    });

    it('shoud return path', function() {
      let path = meta.resolveEndpointPath('detail', model);
      should(path).equal(`/v1/instances/${instanceName}/`);
    });

  });

  describe('#findAllowedMethod()', function() {

    it('is a function of the "meta" property', function() {
      should(meta).have.property('findAllowedMethod').which.is.Function();
    });

    it('should throw error when unsupported methods are passed', function() {
      should(function() {
        meta.findAllowedMethod('list', 'UPDATE');
      }).throw(Error('Unsupported request methods: UPDATE.'))
    });

    it('should return supported method', function() {
      let method = meta.findAllowedMethod('list', 'GET');
      should(method).equal('get');
    });

  });

});

describe('Base model methods', function() {
  let model = null;
  let model_single = null;
  let api = null

  beforeEach(function() {
    model = Syncano({ name: instanceName, baseUrl: testBaseUrl }).Instance;
    model_single = Instance;
    api = nock(testBaseUrl)
            .filteringRequestBody(function() {
              return '*';
            });
  });

  describe('#please()', function() {

    it('should be a method of the model', function() {
      should(model).have.property('please').which.is.Function();
    })

    it('should return QuerySet object', function() {
      let qs = model.please();
      should(qs).be.type('object');
    });

  });

  describe('#isNew()', function() {

    it('should be a method of the model', function() {
      should(model_single()).have.property('isNew').which.is.Function();
    });

    it('should return true if no "links" property is fond on the model', function() {
      should(model_single().isNew()).equal(true);
    });

    it('should return false if "links" property is fond on the model', function() {
      should(model_single({ links: {} }).isNew()).equal(false);
    });

  });

  describe('#validate()', function() {

    it('should be a method of the model', function() {
      should(model_single()).have.property('validate').which.is.Function();
    });

    it('should enable validation', function() {
      should(model_single.setConstraints({})().validate()).not.be.ok;
      should(model_single().validate()).have.property('name').which.is.Array();
      should(model_single({ name: testName}).validate()).not.be.ok;
    });

  });

  describe('#save()', function() {

    it('should be a method of the model', function(){
      should(model_single()).have.property('save').which.is.Function();
    });

    it('should check if required data is present', function() {
      model_single().save().catch((err) => {
        should(function() {
          throw err;
        }).throw(new ValidationError());
      });
    })

    it('should save model', function() {
      api.post('/v1/instances/', '*').reply(201, {
            name: instanceName,
            links: {}
          });
      model({name: instanceName}).save().then((instance) => {
        should(instance).be.an.Object();
        should(instance).have.property('name').which.is.String().equal(instanceName);
      });
    });

    it('should throw error when server response is error', function() {
      api.post('/v1/instances/', '*').reply(404);
      model({name: instanceName}).save().catch((err) => {
        should(function() {
          throw err;
        }).throw(new Error());
      });
    });

  });

  describe('#delete()', function() {
    it('should be a method of the model', function(){
      should(model_single()).have.property('delete').which.is.Function();
    });

    it('should delete model record', function() {
      api.delete(`/v1/instances/${instanceName}/`, '*').reply(204);
      model({name: instanceName}).delete();
    });

    it('should throw error when server response is error', function() {
      api.delete('/v1/instances/${instanceName}/', '*').reply(404);
      model({name: instanceName}).delete().catch((err) => {
        should(function() {
          throw err;
        }).throw(new Error());
      });
    });
  })

});