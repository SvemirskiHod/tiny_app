"use strict";
const bcrypt = require('bcrypt-nodejs');
const cookieSession = require('cookie-session');
const express = require("express");
const app = express();
app.use(express.static('public'));
const PORT = process.env.PORT || 3000;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["random key"],
  maxAge: 24 * 60 * 60 * 1000 // I copied this from the readme, didn't want to mess with it!
}))
app.set("view engine", "ejs");

const usersDatabase = {};
const urlDatabase = {};

///////////////////
/// FUNCTIONS   ///
///////////////////

const checkLink = function (shortLink){
  for (var email in urlDatabase){
    for (var shortUrl in urlDatabase[email]){
      if (shortLink === shortUrl){
        return urlDatabase[email][shortUrl];
      }
    }
  }
  return false;
}

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
  let random;
  const characters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (var i = 0; i < lengthOfString; i++){
    random  = Math.floor(Math.random() * characters.length);
    randomString += characters[random];
  }
  return randomString;
}

const generateId = function(lengthOfId){
  let randomString = "";
  let random;
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


app.get("/", (req, res) => { //Simple redirect
    res.redirect("/urls");
});

app.get("/register", (req, res) => { //Directs user to register form
  if(req.session.email){
    res.redirect("/");
  }
  res.render("urls_register", {email: req.session.email});
});

app.post("/register", (req, res) => { //Registers users and updates the database
  if(checkEmail(req.body.email)){
    res.status(400).send("Error Code 400. Email already exists");
  }
  else if(req.body.email && req.body.password){
    const userId = generateId(6);
    const hashedPass = bcrypt.hashSync(req.body.password, 10);
    urlDatabase[req.body.email] = {};
    usersDatabase[userId] = {id: userId, email: req.body.email, password: hashedPass}
    req.session.email = req.body.email;
    res.redirect("/urls");
  }
  else{
    res.status(400).send("Error Code 404. Innapropriate request. Make sure that email and password are filled correctly.");
  }
});

app.get("/login", (req, res) =>{  // Directs user to login form
  if(req.session.email){
    res.redirect("/");
  }
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
      res.status(403).send("Error 403. Passwords do not match.");
    }
  }
  else{
    res.status(403).send("Error 403. Email does not exist in our records.");
  }
});

app.get("/urls", (req, res) => { //Home Page for Logged in users. Displays their URLs
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
  if(req.session.email){
    res.render("urls_new", {email: req.session.email});
  }
  else {
    res.send("Please login before attempting to crete a link.");
  }
});

app.post("/urls", (req, res) => {     //Applies logic when new URL is created and indexed with long URL
  if(req.session.email){
    if (req.body.longURL.indexOf("http:/") !== -1 || req.body.longURL.indexOf("https:/") !== -1){
      let newShort = generateRandomString(6);
      urlDatabase[req.session.email][newShort] = req.body.longURL;
      res.redirect("/urls");
    }
    else{
      res.send("Please begin your URL with http:/ or https:/");
    }
  }
  else {
    res.send("Please login before attempting to create a link.");
  }
});

app.post("/urls/:id/delete", (req, res) => { //Handles request to delete a link
  if(req.session.email){
    delete urlDatabase[req.session.email][req.params.id];
    res.redirect("/urls");
  }
  else {
    res.send ("You cannot delete links without being logged in.")
  }
});

app.get("/urls/:id/edit", (req, res) => {  //Renders page where users edit links
  if(req.session.email){
    res.render("urls_edit", {
      id: req.params.id,
      email: req.session["email"],
      longURL: urlDatabase[req.session.email][req.params.id]
    });
  }
  else {
    res.send("You must be logged in to edit a link.")
  }
});

app.post("/urls/:id", (req, res) => { //Handles the request to edit an exisitng link
  urlDatabase[req.session.email][req.params.id] = req.body.replacementURL;
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => { // Redirects to Full websites using short URL (If logged in)
  //console.log(req.session.email);
  if (req.session.email){
    if(urlDatabase[req.session.email].hasOwnProperty(req.params.shortURL)){
      let longURL = urlDatabase[req.session.email][req.params.shortURL];
      res.redirect(longURL);
    }
    else {
      res.send("This specified short link does not exist in your account.")
    }
  }
  else{
  res.send("Please login before attempting to access your short links.");
  }
});

app.get("/u/:shortURL", (req, res) => { // Redirects to Full websites using short URL (Anyone can use)
  let link = checkLink(req.params.shortURL)
  if(link !== false){
    res.redirect(link);
  }
  else{
    res.send("This short link does not exist.");
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
