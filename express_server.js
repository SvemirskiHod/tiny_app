//TODO : Make short links and long URLs Clickable links

//"use strict";
var cookieParser = require('cookie-parser')
var express = require("express");
var app = express();
app.use(express.static('public'));
app.use(cookieParser())
var PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "bh6tsa": "http://www.google.ca"
};

////////////////////////////
/// Begin Route Handling ///
////////////////////////////
app.get("/urls", (req, res) => { //Home Page for URLs
  let templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => { //Renders page where users create new links
  res.render("urls_new", {username: req.cookies["username"]});
});

app.post("/urls", (req, res) => {     //Applies logic where new URL is created and indexed with long URL
  newShort = generateRandomString(6);
  urlDatabase[newShort] = req.body.longURL;
  res.redirect("/urls"); //+newShort);  //!!!!!!!!!!!!!!!!!!
});

app.post("/urls/:id/delete", (req, res) => { //Handles request to delete a link
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.get("/urls/:id/edit", (req, res) => {  //Renders page where users edit links
  res.render("urls_edit", {
    id : req.params.id,
    username: req.cookies["username"]
  });
});

app.post("/urls/:id", (req, res) => { //Handles the request to edit an exisitng link
  urlDatabase[req.params.id] = req.body.replacementURL;
  res.redirect("/urls");
});


app.get("/urls/:shortURL", (req, res) => { // Redirects to Full websites using short URL
  if(urlDatabase.hasOwnProperty(req.params.shortURL)){
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
  }
  else {
    res.send("This specified short link does not exist.");
  }
});

app.post("/login", (req, res) => {  //Sends client cookie with their username, enables login
  res.cookie("username", (req.body.username));
  res.redirect("/urls")
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

////////////////////////////
/// Finish Route Handling///
////////////////////////////

app.listen(PORT, () => {
  console.log(`Tiny_app server listening on port ${PORT}!`);
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

