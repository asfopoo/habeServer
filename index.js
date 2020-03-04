var express = require('express');
var app = express();
var mysql = require('mysql');
var bodyParser = require('body-parser');
var cors = require('cors');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var jwt = require('jsonwebtoken');
var config = require('./config.json');


/*/////swagger stuff
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));*/

//start mysql connection
var connection = mysql.createConnection({
  host: config.DB_HOST,
  user: config.DB_USER_NAME,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  port: config.DB_PORT
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
var server = app.listen(config.SERVER_PORT, "0.0.0.0", function () {

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
    else if (req.body.UUID !== config.UUID) {
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
          token: token,
          user: results.insertId
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
  else if (req.body.UUID !== config.UUID) {
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
  else if (req.body.UUID !== config.UUID) {
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
              user: foundUser,
              token: token,
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


//verified by jwt
app.post('/user', function (req, res) {
  if (!req.body.jwt || !req.body.userId) {
    res.statusMessage = "Request does not contain required fields";
    res.sendStatus(401);
  }
  else {
    jwt.verify(req.body.jwt, 'cmV0dXJubG9naWM=', {algorithm: 'RS256'}, function (err, decoded) {
      if (err) {
        res.statusMessage = "Invalid JWT";
        res.sendStatus(403);
      }
      else {
        connection.query("SELECT * FROM habe.user WHERE id = ?", [req.body.userId], function (error, results) {
          if (error) throw error;
          res.end(JSON.stringify(results));
        });
      }
    })
  }
});

app.post('/interests', function (req, res) {
  if (!req.body.jwt || !req.body.userId) {
    res.statusMessage = "Request does not contain required fields";
    res.sendStatus(401);
  }
  else {
    jwt.verify(req.body.jwt, 'cmV0dXJubG9naWM=', {algorithm: 'RS256'}, function (err, decoded) {
      if (err) {
        res.statusMessage = "Invalid JWT";
        res.sendStatus(403);
      } else {
        req.body.interests.map(interest => {
          let sql = "INSERT INTO habe.profile (user_id, interest) VALUES ('" + req.body.userId + "', '" + interest.name + "' )";
          connection.query(sql, function (error, results) {
            if (error) throw error;
          });
        });
      }
    });
    res.sendStatus(200);
  }
});

app.post('/profile', function (req, res) {
  if (!req.body.jwt || !req.body.userId) {
    res.statusMessage = "Request does not contain required fields";
    res.sendStatus(401);
  }
  else {
    jwt.verify(req.body.jwt, 'cmV0dXJubG9naWM=', {algorithm: 'RS256'}, function (err, decoded) {
      if (err) {
        res.statusMessage = "Invalid JWT";
        res.sendStatus(403);
      }
      else {
          connection.query("SELECT * FROM habe.profile WHERE user_id = ?", [req.body.userId], function (error, results) {
            if (error) throw error;
            res.end(JSON.stringify(results));
          });
      }
    })
  }
});





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
