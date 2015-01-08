var Client = require('./lib/client').Client,
	config = require('./lib/config').Config,
	_ = require('underscore'),
	uuid = require('node-uuid');

var client = new Client({
	awsKey: config.get('awsKey'),
	awsSecret: config.get('awsSecret'),
	awsRegion: config.get('awsRegion'),
	sqsQueue: config.get('sqsQueue'),
	s3Bucket: config.get('s3Bucket')
});

var file = 'test.jpg';

_.times(1, function() {

	var destination = '/images/' + uuid.v4() + '/' + file;

	client.upload(file, destination, function(err) {
		if (err) throw err;
		client.thumbnail(destination, [{
				"name": "tiny",
				"width": 48,
				"height": 48
      },
			{
				"name": "small",
				"width": 100,
				"height": 100,
				"background": "red"
      },
			{
				"name": "medium",
				"width": 150,
				"height": 150,
				"strategy": "bounded"
      }], {
			notify: tunnelURL + '/notify' // optional web-hook when processing is done.
		});
	});

});

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
	extended: false
}));

// parse application/json
app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('Hello World');
});

app.post('/notify', function(req, res) {
	console.log(req.body);
	res.json({
		response: 200
	});
});

var server = app.listen(3000, function() {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Example app listening at http://%s:%s', host, port)
});


var localtunnel = require('localtunnel'),
	tunnelURL = null;

if (!localtunnel) throw 'Missing localtunnel. Please `npm install -g localtunnel`.';

localtunnel(3000, {
	subdomain: 'mahonstudios'
}, function(err, tunnel) {
	if (err) throw err;

	// the assigned public url for your tunnel
	// i.e. https://abcdefgjhij.localtunnel.me
	tunnelURL = tunnel.url;
	console.log('Local tunnel created at: ' + tunnelURL);
});
