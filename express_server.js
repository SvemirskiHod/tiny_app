//TODO : Make short links and long URLs Clickable links

//"use strict";
const bcrypt = require('bcrypt');
var cookieSession = require('cookie-session');
var express = require("express");
var app = express();
app.use(express.static('public'));
var PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["random key"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))


app.set("view engine", "ejs");

const usersDatabase = {}

var urlDatabase = {};

///////////////////
/// FUNCTIONS   ///
///////////////////

const findPassword = function (email){
  for (var userKey in usersDatabase){
    if (usersDatabase[userKey].email === email){
        return usersDatabase[userKey].password;
    }
  }
}

const checkEmail = function (email){
  for (var userKey in usersDatabase){
    if (usersDatabase[userKey].email === email){
        return true;
    }
  }
  return false;
}

const generateRandomString = function(lengthOfString){
  let randomString = "";
  const characters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (var i = 0; i < lengthOfString; i++){
  random  = Math.floor(Math.random() * characters.length);
  randomString += characters[random];
  }
  return randomString;
}

const generateId = function(lengthOfId){
  let randomString = "";
  const characters = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (var i = 0; i < lengthOfId; i++){
  random  = Math.floor(Math.random() * characters.length);
  randomString += characters[random];
  }
  return randomString;
}

//////////////////////
/// END FUNCTIONS  ///
//////////////////////

////////////////////////////
/// Begin Route Handling ///
////////////////////////////
app.get("/urls", (req, res) => { //Home Page for URLs
  let templateVars = {
    email: req.session.email,
    urls: urlDatabase
  };

  if (req.session.email){
  res.render("urls_index", templateVars);
  }
  else{
    res.redirect("/login");
  }
});

app.get("/urls/new", (req, res) => { //Renders page where users create new links
  res.render("urls_new", {email: req.session.email});
});

app.post("/urls", (req, res) => {     //Applies logic where new URL is created and indexed with long URL
  newShort = generateRandomString(6);
  urlDatabase[req.session.email][newShort] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect("/urls"); //+newShort);  //!!!!!!!!!!!!!!!!!!
});

app.post("/urls/:id/delete", (req, res) => { //Handles request to delete a link
  delete urlDatabase[req.session.email][req.params.id];
  res.redirect("/urls");
});

app.get("/urls/:id/edit", (req, res) => {  //Renders page where users edit links
  res.render("urls_edit", {
    id: req.params.id,
    email: req.session["email"]
  });
});

app.post("/urls/:id", (req, res) => { //Handles the request to edit an exisitng link
  urlDatabase[req.session.email][req.params.id] = req.body.replacementURL;
  res.redirect("/urls");
});


app.get("/urls/:shortURL", (req, res) => { // Redirects to Full websites using short URL
  for (var email in urlDatabase){
    if(urlDatabase[email].hasOwnProperty(req.params.shortURL)){
    let longURL = urlDatabase[email][req.params.shortURL];
    res.redirect(longURL);
    }
    else {
      res.send("This specified short link does not exist.");
    }
  }
});

app.get("/login", (req, res) =>{  // Directs user to login form
  res.render("urls_login", {email: req.session.email});
});

app.post("/login", (req, res) => {  //Authenticates passwords and email for login
  let email = req.body.email;
  let password = req.body.password;
  if (checkEmail(email)){
    if(bcrypt.compareSync(password, findPassword(email))){
      req.session.email = email;
      res.redirect("/urls")
    }
    else{
      res.status(403).send("Passwords do not match.");
    }
  }
  else{
      res.status(403).send("Email does not exist in our records.");
  }
});

app.get("/register", (req, res) => { //Directs user to register form
  res.render("urls_register", {email: req.session.email});
});

app.post("/register", (req, res) => { //Registers users and updates the database
  if(checkEmail(req.body.email)){
    res.status(400).send("Error Code 400. Email already exists");
  }
  else if(req.body.email && req.body.password){
    const userId = generateId(6);
    let hashedPass = bcrypt.hashSync(req.body.password, 10);
    urlDatabase[req.body.email] = {};
    usersDatabase[userId] = {id: userId, email: req.body.email, password: hashedPass}
    console.log(urlDatabase);
    req.session.email = req.body.email;
    res.redirect("/urls");
  }
  else{
    res.status(400).send("Error Code 404. Innapropriate request. Make sure that email and password are filled correctly.");
  }
});

app.post("/logout", (req, res) => { // Handles log out functionality by clearning cookies
  req.session = null;
  res.redirect("/urls");
});

////////////////////////////
/// Finish Route Handling///
////////////////////////////

app.listen(PORT, () => {
  console.log(`Tiny_app server listening on port ${PORT}!`);
});






