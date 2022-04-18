const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const morgan = require("morgan");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const auth = require("./auth");

const app = express();

app.use(morgan("tiny"));
app.use(cors());
app.use(cookieParser);
app.use(bodyParser.json());

var loginVerification = false;

// Connecting to the local mySQL server
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "qweasdzxc",
  database: "project",
});

// Connecting to the AWS RDS mySQL server
// var connection = mysql.createConnection({
//   host: "database-2.c0pbv8ca91j5.us-east-1.rds.amazonaws.com",
//   user: "admin",
//   password: "qweasdzxc",
//   database: "pickup",
// });

var person = {
  email:null,
  password:null
}

var rand,mailOptions,host,link;

var smtpTransport = nodemailer.createTransport({
  service: "QQ",
  auth: {
      user: "2316293336@qq.com",
      pass: "tpqedtppgfcfebie"
  }
});

// Connet to mysql
connection.connect(function (err) {
  if (err) throw err;
});


// Post route (Client post something to the server)
// This route is called when server receives something from the client
app.post("/register", function (req, res) {
  console.log("able to step in");
  // Obtain the client side info with the help of body-parser package
  var person = {
    email: req.body.userAccount,
    password: req.body.password
  };

  console.log(person);

  // var q = "INSERT INTO  SET ?";
  // connection.query(q, person, function (err, result) {
  //   if (err) throw err;
  // });
});

app.get('/verify', function(req,res){

  console.log(req.protocol+":/"+req.get('host'));
  if((req.protocol+"://"+req.get('host'))==("http://"+host)){
      console.log("Domain is matched. Information is from Authentic email");
      if(req.query.id==rand)
      {
          console.log("email is verified");

          // encryptedPassword = bcrypt.hash(person.password, 10);
          // person.password = encryptedPassword;

          var q = "INSERT INTO user_info SET ?";
          connection.query(q, person, function (err, result) {
          if (err) throw err;
          });
          console.log(person.email);
          console.log(person.password);

          // const token = jwt.sign(person.email, jwtKey, {
          //   algorithm: "HS256",
          //   expiresIn: "2h",
          // });
          
          // res.cookie("token", token, { maxAge: 1000*60*60 });
          res.redirect('http://localhost:8080/');
          // console.log(token);
          // res.end("Email "+mailOptions.to+" is been Successfully verified");
      }
      else
      {
          console.log("email is not verified");
          res.end("Bad Request");
      }
  }
  else
    {
        res.end("Request is from unknown source");
    }
});


app.post("/login", function (req, res) {
  var person = {
    email: req.body.userAccount,
    password: req.body.password
  };

  console.log(person);

  var sql = "SELECT password FROM ?? WHERE ?? = ?";
  var inserts = ['accountInfo', 'email', person.email];
  sql = mysql.format(sql, inserts);
  connection.query(sql, person, function(err, result){

    var password = result[0].password;
    if(password = person.password){
        pack.verificationResult = true;

        // const token = jwt.sign(person.email, jwtKey, {
        //   algorithm: "HS256",
        //   expiresIn: "2h",
        // });
  
        // res.cookie("token", token, { maxAge: 1000*60*60 });
        res.redirect('/');
    }
    else{
      loginVerification = false;
    }
    res.json(pack);
  });
});

/**
 * @description
 * Get the password data stored in database with provided admin_email
 */
function adminLogin(admin_email, admin_password, callback) {
  connection.query({
    sql: 'SELECT * FROM `admin_account` WHERE admin_email = ?',
    values: [admin_email]
  }, function(err, results) {
    console.log(results);
    if(results[0].admin_password === admin_password) {
      return callback({matched: true});
    }
    else{
      return callback({matched: false});
    }
  });
}

/**
 * @description
 * For the given email, Check whether the provided password matches that in the database
 */
app.post('/adminLogin', function(req,res){
  adminLogin(req.body.admin_email, req.body.admin_password, function(response) {
    if(response.matched) {
      res.json({adminLoginSucceed: true});
    }
    else {
      res.json({adminLoginSucceed: false});
    }
  })
});


const port = process.env.PORT || 4000;


app.listen(port, () => {
  console.log(`listening on ${port}`);
});