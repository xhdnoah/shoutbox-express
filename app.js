const entries = require('./routes/entries')
const validate = require('./middleware/validate')
const register = require('./routes/register')
const session = require('express-session')
const messages = require('./middleware/messages')
const login = require('./routes/login')
const user = require('./middleware/user')
const api = require('./routes/api')
const Entry = require('./models/entry')

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
	extended: true
}));
// app.use(express.methodOverride)
app.use(cookieParser());
app.use(session({
	secret: 'secret',
	resave: false,
	saveUninitialized: true
}))
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', api.auth)
// 加载数据到中间件放在 express.static 下面，避免每次返回静态文件都要获取用户数据
app.use(user)
app.use(messages)
// app.use('/', indexRouter);
app.get('/', entries.list)
app.use('/users', usersRouter);

app.get('/login', login.form)
app.post('/login', login.submit)
app.get('/logout', login.logout)

app.get('/register', register.form)
app.post('/register', register.submit)

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

app.get('/post', entries.form)
app.post('/post', entries.submit)

app.get('/api/user/:id', api.user)
app.get('/api/entries/:page?', page(Entry.count), api.entries)
app.post('/api/entry', entries.submit)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});
module.exports = app;