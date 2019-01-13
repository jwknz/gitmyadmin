const request = require('superagent')

const path = require('path')
const crypto = require("crypto")

const express = require('express')
const app = express()
const port = 3000

const fetch = require('node-fetch')
const Bluebird = require('bluebird')
fetch.Promise = Bluebird

const randomstring = require("randomstring")
const r1 = randomstring.generate();

// Objects
require('dotenv').load()

// Credentials
const credentials = {
    auth: {
        tokenHost: 'https://github.com',
        tokenPath: '/login/oauth/access_token',
        authorizePath: '/login/oauth/authorize',
    }
  };

//DB STUFF
const mysql = require('mysql')

const con = mysql.createConnection({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    database: process.env.DBNAME
})

// Hash

let Secret = new (function (){
    "use strict";

    let world_enc = "utf8"
    let secret_enc = "hex";
    let key = r1;

    this.hide = function(payload){
        let cipher = crypto.createCipher('aes128', key);
        let hash = cipher.update(payload, world_enc, secret_enc);
        hash += cipher.final(secret_enc);
        return hash;
    };
    this.reveal = function(hash){
        let sha1 = crypto.createDecipher('aes128', key);
        let payload = sha1.update(hash, secret_enc, world_enc);
        payload += sha1.final(world_enc);
        return payload;
    }
});

// CORS - Allow cors (for now)

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
  })

// BODY Parser

const bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// STATIC PATHS

app.use('/css', express.static(path.join(__dirname, "src", "stylesheets")))
app.use('/script', express.static(path.join(__dirname, "src", "scripts")))

// FRONT END

app.get('/', (req, res) => {
    console.log(__dirname)
    res.sendFile(path.join(__dirname + "/src/index.html"))
})

app.get('/your_admin/', (req, res) => {
    res.sendFile(path.join(__dirname + "/src/home.html"))
})

////////////////

// 1. Request a user's GitHub identity
// GET https://github.com/login/oauth/authorize

app.get('/showall', (req, res) => {        

    request
    .get(`${credentials.auth.tokenHost}${credentials.auth.authorizePath}`)
    .query(`client_id=${process.env.Client_ID}`)
    .query(`scope=repo:status read:user user:email delete_repo`)
    .then(res1 => {
        res.redirect(credentials.auth.tokenHost+res1.req.path);
    })
})

app.get('/register', (req, res, next) => {   

    const { query } = req
    const { code } = query

    // console.log(query);
    // console.log(code);

    res.redirect(`/getdata/${code}`);
})

app.get('/getdata/:token', (req, res) => {
    
    const code = req.params.token;
    
    if(!code) {
        return res.send({
            success: false,
            message: 'Error: no code'
        })
    } else {  

        // 2. Users are redirected back to your site by GitHub
        // POST https://github.com/login/oauth/access_token

        request
        .post('https://github.com/login/oauth/access_token')
        .send({ 
            client_id: process.env.Client_ID, 
            client_secret: process.env.Client_Secret,
            code: code 
        })
        .set('Accept', 'application/json')
        .then(result => {

            // 3. Your GitHub App accesses the API with the user's access token
            // GET https://api.github.com/user?access_token=...

            request
            .get('https://api.github.com/user')
            .query({'access_token' : result.body.access_token})
            .set('Accept', 'application/json')
            .then(result => {

                // Save to our database
                updateDatabase(result.body, code)
                
                let user = Secret.hide(result.body.login)
                res.redirect(`/your_admin?q=${user}`)
            })
        })
    }
})

app.get('/home/:user', (req, res) => {

    const u = Secret.reveal(req.params.user)

    const sql = 'SELECT TOKEN FROM `gma_users` WHERE USERNAME = "' + u + '" ';

    con.query(sql, function (err, result) {
        if (err) throw err

        request
        .get(`https://api.github.com/users/${u}/repos`)
        .query({ 
            client_id: process.env.Client_ID, 
            client_secret: process.env.Client_Secret,
            code: result[0].TOKEN 
        })
        .set('Accept', 'application/json')
        .then(res1 => {
            res.send(res1.body)
        })
        .catch(err => {
            res.redirect('/')
        })
    }) 
})

app.get('/branches/:username/:repo', (req, res) => {

    request
    .get(`https://api.github.com/repos/${req.params.username}/${req.params.repo}/branches`)
    .query({ 
        client_id: process.env.Client_ID, 
        client_secret: process.env.Client_Secret
    })
    .set('Accept', 'application/json')
    .then(res1 => {
        res.send(res1.body)
    })
    .catch(err => {
        console.log(err)
    })

})

app.get('/rates', (req, res) => {

    const access = `client_id=${process.env.Client_ID}&client_secret=${process.env.Client_Secret}`

    fetch(`https://api.github.com/rate_limit?${access}`)
    .then(response => response.json())
    .then(json => res.send(json))
})

function updateDatabase(json, token) {

    const loc = json.location.replace(", ", " - ")

    let t = con.connect(function(err) {
        if (err) throw err

        const check = 'SELECT ID FROM `gma_users` WHERE USERNAME = "' + json.login + '"'

        con.query(check, function (err, reslt) {
            if (err) throw err
            return reslt.length
        })
    })

    if(t == 0) {

        const sql = 'INSERT INTO gma_users (USERNAME, GITHUB_ID, REPO_URL, LOCATION, AVATAR, EMAIL, TOKEN, CREATION_DATE, UPDATE_DATE) VALUES ("' + json.login + '","' + json.id + '","' + json.repos_url + '","' + loc + '","' + json.avatar_url + '","' + json.email + '","' + token + '", NOW(), NOW());'

        con.query(sql, function (err, result) {
            if (err) throw err
            console.log("1 record inserted")
        })                   
    } else {
        // console.log("token is already in database")

        const sql = 'UPDATE gma_users SET USERNAME = "' + json.login + '", REPO_URL =  "' + json.repos_url + '", LOCATION = "' + loc + '", AVATAR =  "' + json.avatar_url + '", EMAIL =  "' + json.email + '", TOKEN =  "' + token + '", UPDATE_DATE = NOW() WHERE GITHUB_ID = "' + json.id + '"';

        con.query(sql, function (err, result) {
            if (err) throw err
            console.log("1 record updated")
        })   

        // console.log(sql)
    }
}

app.listen(port, () => console.log(`Server listening.... ${port}`))