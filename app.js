const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const app = express();


// connect to mongoDB
mongoose.connect('mongodb://localhost/session-auth-2');
const db = mongoose.connection;

const routes = require('./routes/route');

// set up session
app.use(session({
    store: new MongoStore({
        mongooseConnection: db,
        ttl: (1 * 60 * 60)
    }),
    secret: 'work hard',
    saveUninitialized: true,
    resave: false,
    cookie: {
        path: "/",
        maxAge: 1800000
    },
    name: "id"
}));

session.Session.prototype.login = function (user, cb) {
    const req = this.req;
    req.session.regenerate(function(err) {
        if (err) {
            cb(err);
        }
    });

    req.session.userInfo = user;
    cb();
};

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/', routes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    let err = new Error('File Not Found');
    err.status = 404;
    next(err);
});

// error handler
// define as the last app.use callback
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        message: err.message
    });
});

module.exports = app;

