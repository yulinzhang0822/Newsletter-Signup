const bodyParser = require("body-parser");
const express = require("express");
const request = require("request");

const https = require("https");
const fs = require("fs");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));

// Provide local static repo to express
app.use(express.static("public"));

var contents = fs.readFileSync(__dirname + "/secret.json");
var secretInfo = JSON.parse(contents);
const listID = secretInfo.listID;
//console.log(listID);
const APIKey = secretInfo.APIKey;
//console.log(APIKey);

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/signup.html");
});

app.post("/", function(req, res) {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;

  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName
        }
      }
    ]
  };

  const jsonData = JSON.stringify(data);

  const url = "https://us19.api.mailchimp.com/3.0/lists/" + listID;
  const options = {
    method: "POST",
    auth: "yuliz12:" + APIKey
  };

  const request = https.request(url, options, function(response) {
    // The data get sent back external server
    var status = Number(response.statusCode);
    if(status === 200) {
      res.sendFile(__dirname + "/success.html");
    } else {
      res.sendFile(__dirname + "/failure.html");
    }
    response.on("data", function(data) {
      //console.log(JSON.parse(data));
    });
  });

  request.write(jsonData);
  request.end();
});

// Handle signup failure
app.post("/failure", function(req, res) {
  res.redirect("/");
});

// Change from 3000 to the port that the Heroku server uses
app.listen(process.env.PORT || 3000, function() {
  console.log("Server is running on port 3000.");
});
