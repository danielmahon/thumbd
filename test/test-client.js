var assert = require('assert'),
  Client = require('../lib').Client,
  config = require('../lib').Config;

describe('upload', function() {
  it("should call saver with default bucket and region", function(done) {
    var Saver = function() {},
      client = new Client({
        Saver: Saver
      });

    Saver.prototype.save = function(bucket, region, source, destination, callback) {
      assert.equal(bucket, 'foo-bucket');
      assert.equal(region, 'us-east-1');
      done();
    };

    config.set('s3Bucket', 'foo-bucket');
    client.upload('/foo.jpg', '/bar/snuh.jpg', {}, function() {});
  });

  it("should allow bucket and region to be overridden", function(done) {
    var Saver = function() {},
      client = new Client({
        Saver: Saver
      });

    Saver.prototype.save = function(bucket, region, source, destination, callback) {
      assert.equal(bucket, 'bar-bucket');
      assert.equal(region, 'us-west-1');
      done();
    };

    config.set('s3Bucket', 'foo-bucket');
    client.upload('/foo.jpg', '/bar/snuh.jpg', {
      awsRegion: 'us-west-1',
      s3Bucket: 'bar-bucket'
    }, function() {});
  });

});

describe('thumbnail', function() {
  it("should create prefix based on originalImagePath", function(done) {
    var client = new Client({
      sqs: {
        sendMessage: function(sqsObject) {
          var obj = JSON.parse(
            sqsObject.MessageBody
          )
          assert.equal(obj.prefix, '/foo/bar');
          done();
        },
        endpoint: {} // adhere to SQS contract.
      },
    });

    client.thumbnail('/foo/bar.jpg', []);
  });

  it("should allow prefix to be overridden by opts", function(done) {
    var client = new Client({
      sqs: {
        sendMessage: function(sqsObject) {
          var obj = JSON.parse(
            sqsObject.MessageBody
          )
          assert.equal(obj.prefix, '/banana');
          done();
        },
        endpoint: {} // adhere to SQS contract.
      },
    });

    client.thumbnail('/foo/bar.jpg', [], {prefix: '/banana'});
  });

  it("should allow arbitrary additional parameters to be set in opts", function(done) {
    var client = new Client({
      sqs: {
        sendMessage: function(sqsObject) {
          var obj = JSON.parse(
            sqsObject.MessageBody
          )
          assert.equal(obj.foo, 'bar');
          done();
        },
        endpoint: {} // adhere to SQS contract.
      },
    });

    client.thumbnail('/foo/bar.jpg', [], {foo: 'bar'});
  });

  it('should execute callback when it is the third parameter', function(done) {
    var client = new Client({
      sqs: {
        sendMessage: function(sqsObject, cb) {
          cb(null, 'success');
        },
        endpoint: {} // adhere to SQS contract.
      },
    });

    client.thumbnail('/foo/bar.jpg', [], function(err, message) {
      assert.equal(message, 'success');
      done();
    });
  });

  it('should execute callback when it is the fourth parameter', function(done) {
    var client = new Client({
      sqs: {
        sendMessage: function(sqsObject, cb) {
          cb(null, 'success');
        },
        endpoint: {} // adhere to SQS contract.
      },
    });

    client.thumbnail('/foo/bar.jpg', [], {}, function(err, message) {
      assert.equal(message, 'success');
      done();
    });
  });

});
