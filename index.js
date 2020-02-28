var express = require('express');
var app = express();
var mysql = require('mysql');
var bodyParser = require('body-parser');


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


//start body-parser configuration
app.use( bodyParser.json() );       // to support JSON-encoded bodies
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
    if (!req.body.first_name || !req.body.last_name || !req.body.email) {
      res.statusMessage = "Request does not contain required fields";
      res.sendStatus(401);
    } else {
      console.log('req body', req.body);
      let sql = "INSERT INTO habe.user (first_name, last_name, email, username) VALUES ('" + req.body.first_name + "', '" + req.body.last_name + "', '" + req.body.email + "', '" + req.body.username + ")";
      console.log('User Inserted');
      connection.query(sql, function (error, results) {
        if (error) throw error;
        res.end(JSON.stringify(results));
      });
    }
});
app.get('/users', function (req, res) {
    connection.query('SELECT * from habe.user', function (error, results) {
      if (error) throw error;
      console.log(res);
      res.end(JSON.stringify(results));
    });
});

module.exports = server;
