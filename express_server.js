//TODO : Make short links and long URLs Clickable links
//

//"use strict";
var express = require("express");
var app = express();
app.use(express.static('public'));
var PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "bh6tsa": "http://www.google.ca"
};

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  newShort = generateRandomString(6);
  urlDatabase[newShort] = req.body.longURL;
  console.log(newShort);
  console.log(urlDatabase[newShort]);  // debug statement to see POST parameters
  res.redirect("http://localhost:8080/urls/"); //+newShort);        // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.get("/urls/:id/edit", (req, res) => {
  res.render("urls_edit", {id : req.params.id});
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.replacementURL;
  res.redirect("/urls");
});


app.get("/urls/:shortURL", (req, res) => {
  if(urlDatabase.hasOwnProperty(req.params.shortURL)){
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
  }
  else {
    res.send("This specified short link does not exist.");
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


const generateRandomString = function(lengthOfString){
  let randomString = "";
  const characters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (var i = 0; i < lengthOfString; i++){
  random  = Math.floor(Math.random() * characters.length);
  randomString += characters[random];
  }
  return randomString;
}

