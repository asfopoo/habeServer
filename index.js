var express = require('express');
var app = express();
var mysql = require('mysql');
var bodyParser = require('body-parser');
var cors = require('cors');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var jwt = require('jsonwebtoken');


/*/////swagger stuff
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));*/

//start mysql connection
var connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER_NAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

connection.connect(function(err) {
  if (err) throw err;
  console.log('connected to habe database...')
});

app.use(cors());
app.use(bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));


//create app server
var server = app.listen(process.env.SERVER_PORT, "0.0.0.0", function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log("Server listening at http://%s:%s", host, port)
});



//routes

//verified by uuid
app.post('/createUser', function (req, res) {
    if (!req.body.firstName || !req.body.lastName || !req.body.email || !req.body.username || !req.body.password || !req.body.UUID) {
      res.statusMessage = "Request does not contain required fields";
      res.sendStatus(401);
    }
    else if (req.body.UUID !== process.env.UUID) {
      res.statusMessage = "Not Authorized";
      res.sendStatus(403);
    }
    else {
      const salt = bcrypt.genSaltSync(saltRounds);
      const hash = bcrypt.hashSync(req.body.password, salt);

      let sql = "INSERT INTO habe.user (first_name, last_name, email, username, password) VALUES ('" + req.body.firstName + "', '" + req.body.lastName + "', '" + req.body.email + "', '" + req.body.username + "', '" + hash + "' )";
      connection.query(sql, function (error, results) {
        if (error) throw error;
        let token = jwt.sign({username: req.body.username}, 'cmV0dXJubG9naWM=', {expiresIn: 12960000});
        res.json({
          success: true,
          err: null,
          token
        })
      });
    }
});

//verified by uuid
app.post('/users', function (req, res) {
  if (!req.body.UUID) {
    res.statusMessage = "Request does not contain required fields";
    res.sendStatus(401);
  }
  else if (req.body.UUID !== process.env.UUID) {
    res.statusMessage = "Not Authorized";
    res.sendStatus(403);
  }
  else {
    connection.query('SELECT * FROM habe.user', function (error, results) {
      if (error) throw error;
      res.end(JSON.stringify(results));
    });
  }
});

//verified by uuid
app.post('/login', (req, res) => {
  if (!req.body.UUID) {
    res.statusMessage = "Request does not contain required fields";
    res.sendStatus(401);
  }
  else if (req.body.UUID !== process.env.UUID) {
    res.statusMessage = "Not Authorized";
    res.sendStatus(403);
  }
  else {
    const {username, password} = req.body;

    connection.query('SELECT * FROM habe.user WHERE username = ?', [username], function (error, results) {
      let foundUser = results;
      if (!foundUser) {
        res.statusMessage = "User not found";
        res.sendStatus(403);
      } else {
        bcrypt.compare(password, foundUser[0].password, function (err, result) {
          if (result) {
            let token = jwt.sign({username: foundUser.username}, 'cmV0dXJubG9naWM=', {expiresIn: 12960000});
            res.json({
              success: true,
              err: null,
              token
            })
          } else {
            res.status(401).json({
              success: false,
              token: null,
              err: 'Passwords do not match!'
            })
          }
        });
      }
    });
  }
});

//TODO
//verified by jwt





/*
for Testing and admin only
 */
app.get('/deleteUsers', function (req, res) {
  connection.query('DELETE FROM habe.user', function (error, results) {
    if (error) throw error;
    res.end(JSON.stringify(results));
  });
});



module.exports = server;
