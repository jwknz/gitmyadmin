module.exports = (app, client) => {
    app.get('/login', (req, res, next) => {        
        res.redirect(`https://github.com/login/oauth/authorize?client_id=${process.env.Client_ID}`)
    })
}