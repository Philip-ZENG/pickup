const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const morgan = require("morgan");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();

app.use(morgan("tiny"));
app.use(cors());
app.use(bodyParser.json());

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
  // Obtain the client side info with the help of body-parser package
  
  person.email = req.body.userAccount;
  person.password = req.body.password;

  // Insert the data into database, the syntax comes from the mysql.js package
  rand=Math.floor((Math.random() * 100) + 54);
  host=req.get('host');
  console.log(host);
  link="http://"+req.get('host')+"/verify?id="+rand;
  mailOptions={
      from: "2316293336@qq.com",
      to : person.email,
      subject : "Please confirm your Email account",
      html : "Hello,Please Click on the link to verify your email."+link+">Click here to verify" 
  }

  console.log(mailOptions);
  smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
          console.log(error);
      res.end("error");
    }else{
          console.log("Message sent: " + response.message);
      res.end("sent");
    }
  });
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
          console.log("redirect");
          res.redirect('http://localhost:8080/');
          // console.log(token);
          
          console.log("EmailOption");
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
  
  person.email = req.body.userAccount;
  person.password = req.body.password;
  
  var sql = "SELECT * FROM ?? WHERE ?? = ?";
  var inserts = ['user_info', 'email', person.email];
  sql = mysql.format(sql, inserts);
  
  
  // 获取user_id 并传回LoginView.vue
  
  connection.query(sql, person, function(err, result){
    
    var password = result[0].password;
    var get_user_id = result[0].user_id;

    console.log(password);
    console.log(get_user_id);
    var pack = {
      user_id: get_user_id,
      verificationResult: false,
    }
    
    if(password = person.password){
        pack.verificationResult = true;
    }
    else{
        pack.verificationResult = false
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