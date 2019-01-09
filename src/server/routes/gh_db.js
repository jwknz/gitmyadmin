module.exports = (app, con, request, fetch, client) => {
    app.get('/users', (req, res, next) => {

        const { query } = req
        const { code } = query
    
        if(!code) {
            return res.send({
                success: false,
                message: 'Error: no code'
            })
        } else {    
            console.log(code)
            console.log(`https://api.github.com/user?access_token=${code}&${client}`)

            request
            .post('https://github.com/login/oauth/access_token')
            .send({ 
                client_id: process.env.Client_ID, 
                client_secret: process.env.Client_Secret,
                code: code 
            })
            .set('Accept', 'application/json')
            .then(result => {
                console.log(`CODE => ${code}`)
                console.log(`TOKEN => ${result.body.access_token}`)

                fetch(`https://api.github.com/user?access_token=${result.body.access_token}&${client}`)
                .then(response => response.json())
                .then(json => {

                    con.connect(function(err) {
        
                        if (err) throw err
                        console.log("Connected!")
                
                        const check = 'SELECT ID FROM `gma_users` WHERE USERNAME = "' + json.login + '"'
                
                        con.query(check, function (err, reslt) {
                            if (err) throw err
                            
                            if(reslt.length == 0) {
                                
                                const loc = json.location.replace(", ", " - ")

                                const sql = 'INSERT INTO gma_users (USERNAME, GITHUB_ID, REPO_URL, LOCATION, AVATAR, EMAIL, TOKEN, CREATION_DATE, UPDATE_DATE) VALUES ("' + json.login + '","' + json.id + '","' + json.repos_url + '","' + loc + '","' + json.avatar_url + '","' + json.email + '","' + result.body.access_token + '", NOW(), NOW());'

                                con.query(sql, function (err, result) {
                                    if (err) throw err
                                    console.log("1 record inserted")
                                })                   
                            } else {
                                console.log("token is already in database")

                                // TODO: add update function here...
                            }
                        })
                    })
                })
            })    
        }
    })
}