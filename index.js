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
//start body-parser configuration
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




app.post('/createUser', function (req, res) {
    if (!req.body.firstName || !req.body.lastName || !req.body.email) {
      res.statusMessage = "Request does not contain required fields";
      res.sendStatus(401);
    } else {
      const salt = bcrypt.genSaltSync(saltRounds);
      const hash = bcrypt.hashSync(req.body.password, salt);

      let sql = "INSERT INTO habe.user (first_name, last_name, email, username, password) VALUES ('" + req.body.firstName + "', '" + req.body.lastName + "', '" + req.body.email + "', '" + req.body.username + "', '" + hash + "' )";
      connection.query(sql, function (error, results) {
        if (error) throw error;
        res.end(JSON.stringify(results));
      });
    }
});
app.get('/users', function (req, res) {
    connection.query('SELECT * FROM habe.user', function (error, results) {
      if (error) throw error;
      res.end(JSON.stringify(results));
    });
});
app.get('/deleteUsers', function (req, res) {
  connection.query('DELETE FROM habe.user', function (error, results) {
    if (error) throw error;
    res.end(JSON.stringify(results));
  });
});

app.post('/login', (req, res) => {
  const {username, password} = req.body;

  connection.query('SELECT * FROM habe.user WHERE username = ?', [username], function (error, results) {
    let foundUser = results;
    if (!foundUser) {
      res.statusMessage = "User not found";
      res.sendStatus(403);
    } else {
      bcrypt.compare(password, foundUser[0].password, function(err, result) {
        if (result) {
          let token = jwt.sign({username: foundUser.username}, 'cmV0dXJubG9naWM=', {expiresIn: 12960000});
          res.json({
            sucess: true,
            err: null,
            token
          })
        } else {
          res.status(401).json({
            sucess: false,
            token: null,
            err: 'Entered Password and Hash do not match!'
          })
        }
      });
    }
  });
});


module.exports = server;
