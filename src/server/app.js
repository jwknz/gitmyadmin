require('dotenv').load()

const path = require('path')
const fs = require('path')
const request = require('superagent')

const fetch = require('node-fetch')
const Bluebird = require('bluebird')
fetch.Promise = Bluebird

const express = require('express')
const app = express()
const router = express.Router()
const port = 3000
const mysql = require('mysql')

const octokit = require('@octokit/rest')()
const passport = require('passport')
const GitHubStrategy = require('passport-github').Strategy

// DB Connection

const con = mysql.createConnection({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    database: process.env.DBNAME
})

const client = `client_id=${process.env.Client_ID}&client_secret=${process.env.Client_Secret}`

//API ROUTES
// loading happens here, so that variables can be made first

require('./routes/login')(app) 
require('./routes/gh_db')(app, con, request, fetch, client)


// Allow cors (for now)

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next()
  })

// Static Paths
app.use(express.static(path.join(__dirname, '/public')))

// Login Endpoints



// APP ENDPOINTS

app.get('/', function(req, res) {
    res.sendFile('index.html', {
        root: (__dirname + '/../public')
      })
})
  
// API Endpoints

app.get('/api/', (req, res) => {
        console.log(url)

        fetch(url)
        .then(response => response.json())
        .then(json => res.send(json))
    }
)

app.listen(port, () => console.log(`Server listening.... ${port}`))