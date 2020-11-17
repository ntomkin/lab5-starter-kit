const express = require('express');
const session = require('express-session');
const mustacheExpress = require('mustache-express');
const app = express();
const socket = require('socket.io');

const http = require('http');
const server = http.Server(app);
const io = socket(server);

const Database = require('./lib/database.js');
const Customers = require('./lib/customers.js');
const Subscriptions = require('./lib/subscriptions.js');

//  Init database for later
let database = new Database('./api.db');
(async () => {
  database.wipe().then(async () => {
    let admin_user = await database.register_user("Administrator", "19055555555", "administrator", "admin", "admin@app.com", "1980-03-13");
    console.log('Admin user created', admin_user);
  });
}).call();

// let customers = new Customers();
// let subscriptions = new Subscriptions();

// registers the mustache engine with Express
app.engine("mustache", mustacheExpress());

// sets mustache to be the view engine
app.set('view engine', 'mustache');

// sets /views to be the /views folder
// files should have the extension filename.mustache
app.set('views', __dirname + '/views');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/views'));
app.use(express.json());

app.use(session({
  secret: 'johnny5isalive',
  resave: false,
  saveUninitialized: false
}));

app.use(function (req, res, next) {
  console.log('Current page:', req.originalUrl);

  if(req.originalUrl.indexOf('/customer/') >= 0 && !req.session.user) {
    res.redirect('/app');
    return;
  }
  else if(req.originalUrl.indexOf('/admin/') >= 0) {
    if(!req.session.user) {
      res.redirect('/app');
      return;
    }

    if(req.session.user.username != 'administrator') {
      res.redirect('/app');
      return;
    }
  }

  next();
});

app.get('/', async function(req, res) {
  res.redirect('/app');
  return;
});

app.get('/app', async function(req, res) {
  let data = {};
  res.render('app/index', data);
});

app.post('/app/login', async function(req, res) {
  let data = {};
  let user = await database.authenticate(req.body.username, req.body.password);

  if(!user) {
    data.login_error_message = "Username or password is invalid";
    
    res.render('app/index', data);
  } else {
    req.session.user = user;
    
    if(user.username == 'administrator') 
      res.redirect('/admin');
    else
      res.redirect('/customer');
    return;
  }
});

app.post('/app/register', async function(req, res) {
  let data = {};

  if(req.body.password != req.body.password_verification)
    data.register_error_message = "Password and confirmation do not match";

  else {
    let user = await database.register_user(req.body.name, req.body.phone, req.body.username, req.body.password, req.body.email, req.body.birthdate);

    if(!user) {
      data.register_error_message = "User could not be created";

      res.render('app/index', data);
    } else {
      req.session.user = user;
      
      res.redirect('/customer');
    }
  }
});

app.get('/customer', async function(req, res) {
  let data = { user: req.session.user };
  res.render('customer/index', data);
});

app.get('/customer/profile', async function(req, res) {
  let data = { user: req.session.user };
  res.render('customer/profile', data);
});

app.get('/customer/plan', async function(req, res) {
  let data = { user: req.session.user };
  res.render('customer/plan', data);
});

app.get('/customer/downloads', async function(req, res) {
  let data = { user: req.session.user };
  res.render('customer/downloads', data);
});

app.get('/customer/payment', async function(req, res) {
  let data = { user: req.session.user };
  res.render('customer/payment', data);
});

app.get('/customer/logout', async function(req, res) {
  delete req.session.user;
  res.redirect('/app');
});

app.get(/^(.+)$/, function(req,res) {
    console.log("static file request: " + req.params[0]);
    res.sendFile(__dirname + req.params[0]);
});

server.listen(3000, function() {
  console.log("Server started");
});
