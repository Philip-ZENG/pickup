const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const morgan = require("morgan");

const app = express();

app.use(morgan("tiny"));
app.use(cors());
app.use(bodyParser.json());

// Connecting to the AWS RDS mySQL server
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "qweasdzxc",
  database: "project",
  // host: '127.0.0.1',
  // user: 'root',
  // password: '123321',
  // database: 'pickup',
});

// Connet to mysql
connection.connect(function (err) {
  if (err) throw err;
});

//fetch available activity from database
app.post("/getActivityInfo", function (req, res) {
  var q = "SELECT * FROM activity_info WHERE time > now();";
  connection.query({
    sql:q,
    values: [req.body.today],
  }, function (err, result) {
    if (err) throw err;
    res.json(result);
  });
});

//search for activity with certain title or type
app.post("/searchActivity", function(req, res){
  var q = "SELECT * FROM activity_info WHERE " + req.body.searchType + " = ? AND time > now()";
  connection.query({
    sql: q,
    values: [req.body.userInput]
  }, function(err, result){
      if (err) throw err;
      res.json(result);
  });
});

//search for activity on a certain date
app.post("/searchByDate", function(req, res){
  var q = "SELECT * FROM activity_info where date(time) = ?;";
  connection.query({
    sql: q,
    values: [req.body.dateinput]
  }, function(err, result){
    if (err) throw err;
    res.json(result);
  });
});

//post a new activity
app.post("/postActivity", function(req, res){
  var q = "INSERT INTO activity_info(`title`, `time`, `location`, `description`, `max_capacity`, `quota_left`, `type`) " +
  "VALUES (?,?,?,?,?,?,?);";
  connection.query({
    sql: q,
    values: [req.body.title, req.body.time, req.body.location, req.body.description,
       req.body.number, req.body.number - 1, req.body.type],
  }, function(err, result){
    if (err) throw err;
    q = "SELECT activity_id FROM activity_info WHERE" + 
      "`title` = ? AND `time` = ? AND `location` = ? AND `type` = ?";
    connection.query({
      sql: q,
      values: [req.body.title, req.body.time, req.body.location, req.body.type]
    }, function(err, result){
      if (err) throw err;
      var activity_id = result[0].activity_id;
      q = "INSERT INTO activity_user VALUES(?,?,'MANAGER')"
      connection.query({
        sql:q,
        values: [activity_id, req.body.user_id]
      }, function (err, result) {
        if (err) throw err;
        res.json({succeed: true});
      })
    });
  });
});

//sort the activity
app.post('/MostRecent', function(req,res){
  var q = "SELECT * FROM activity_info WHERE time > now() ORDER BY `time`";
  connection.query(q, function(err, result){
    if (err) throw err;
    res.json(result);
  });
});

//get the members' user_id list of a certain activity 
function getMemberList(activity_id, callback){
  var q = "SELECT * FROM activity_user WHERE activity_id = ?";
  var members = [[], []];
  connection.query({
    sql: q,
    values: [activity_id]
  }, function(err, result){
    if (err) throw err;
    for(var i = 0; i < result.length; i++){
      if(result[i].role === 'MANAGER') members[0].push(result[i].user_id);
      else members[1].push(result[i].user_id);
    }
    return callback(members);
  });
}

//get the profile information for a certain user
function getManagerName(user_id, callback){
  var q = 'SELECT `user_name` from user_info WHERE user_id = ?';
  connection.query({
    sql:q,
    values: [user_id]
  }, function(err, result){
    if (err) throw err;
    return callback(result[0]);
  })
}

async function pack_profile_info(activity_id){
  var myPromise1 = function(activity_id){
    return new Promise(function(resolve){
      getMemberList(activity_id, (result) => {
        resolve(result);
      });
    });
  }

  var myPromise2 = function(user_id){
    return new Promise(function(resolve){
      getManagerName(user_id, (data) =>{
        resolve(data);
      });
    });
  }

  const memberList = await myPromise1(activity_id);
  const managerName = (await myPromise2(memberList[0][0])).user_name;
  var pack = { idList: memberList, name: managerName};
  return pack;
}

//return the members' profile information
app.post('/activityMember', function(req, res){
  pack_profile_info(req.body.activity_id)
    .then(response => {
      res.json(response);
    })
    .catch(() => {
      console.log("error");
    });
});

//user can join activity 
app.post('/joinActivity', function(req, res){
  var q1 = "INSERT INTO activity_user VALUES(?,?,'MEMBER')";
  connection.query({
    sql: q1,
    values: [req.body.activity_id, req.body.user_id]
  })
  var q2 = "UPDATE activity_info SET quota_left=quota_left - 1 WHERE activity_id = ?";
  connection.query({
    sql: q2,
    values: [req.body.activity_id]
  })
})

const port = process.env.PORT || 4001;

app.listen(port, () => {
  console.log(`listening on ${port}`);
});