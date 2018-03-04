const express = require('express');
const _ = require('lodash');
const router = express.Router();

const User = require('../models/user');
const requireLogin = require('../utlis/authenticate');

router.get('/', (req, res) => {
    console.log("SESSION",req.session);
    res.sendFile('/index.html');
});

router.post('/', (req, res, next) => {
    const body = _.pick(req.body, ["email", "username", "password", "passwordConf"]);

    if (Object.keys(body).length === 4 && body.password === body.passwordConf) {
        const user = new User({
            email: body.email,
            username: body.username,
            password: body.password
        });

        user.save()
            .then(() => res.redirect('/'))
            .catch(err => console.log(err));
    } else {
        let err = new Error('Fill the form correctly');
        next(err);
    }
});

router.post('/login', (req, res, next) => {
    const body = _.pick(req.body, ["email", "password"]);

    if (Object.keys(body).length === 2) {
        User.findByCredentials(body.email, body.password)
            .then((user) => {
                req.session.login(user, function(err) {
                    if (err) {
                        let error = new Error('There was an error logging in. Please try again later.');
                        error.status = 500;
                        next(err);
                    } else {
                        res.redirect('/profile');
                    }
                })
            }).catch((err) => {
                let error = new Error('There was an error logging in. Please try again later.');
                error.status = 500;
                next(error);
            });
    } else {
        let error = new Error('FIll the form the correctly');
        next(error)
    }
});

router.get('/profile', requireLogin, (req, res, next) => {
    const user = req.session.userInfo;
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Profile</title>
    </head>
    <body>
        <h1>Name:${user.username}</h1>
        <h2>Email:${user.email}</h2>
        <p>
            <a href='/logout'>Logout</a>
        </p>
    </body>
    </html>
    `);
});

router.get('/logout', requireLogin,(req, res, next) => {
    req.session.destroy(err => {
        if (err) {
            next(err);
        } else {
            res.redirect('/');
        }
    });
});

module.exports = router;