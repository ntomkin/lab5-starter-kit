const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const Database = require('./lib/database.js');
const Customers = require('./lib/customers.js');
const Subscriptions = require('./lib/subscriptions.js');

//  Init database for later
let database = new Database('./api.db');

let customers = new Customers();
let subscriptions = new Subscriptions();

// include the mustache template engine for express
const mustacheExpress = require('mustache-express');

// registers the mustache engine with Express
app.engine("mustache", mustacheExpress());

// sets mustache to be the view engine
app.set('view engine', 'mustache');

// sets /views to be the /views folder
// files should have the extension filename.mustache
app.set('views', __dirname + '/views');

app.get('/', async function(req, res) {
  res.send("Hey");
});

app.get('/api/customers/:id', async function(req, res) {
  let customer = await customers.get(req.params.id);
  res.send(customer);
});

app.post('/api/customers/:id/source', async function(req, res) {
  let source = await customers.add_payment_source(req.params.id, req.body.email);
  res.send(source);
});

app.post('/api/customers', async function(req, res) {
  let customer = await customers.create(req.body.name, req.body.email);
  res.send(customer);
});

app.post('/api/subscriptions', async function(req, res) {
  let subscription = await subscriptions.create(req.body.customer_id, req.body.plan_name);
  res.send(subscription);
});

app.get('/api/subscriptions/:id', async function(req, res) {
  let subscription = await subscriptions.get(req.params.id);
  res.send(subscription);
});

app.get(/^(.+)$/, function(req,res) {
    console.log("static file request: " + req.params[0]);
    res.sendFile(__dirname + req.params[0]);
});

app.listen(3000, function() {
  console.log("server listening...");
});
