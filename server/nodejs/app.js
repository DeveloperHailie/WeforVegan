const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan')
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

dotenv.config();
const indexRouter = require('./routes');
const loginRouter = require('./routes/login');
const logoutRouter = require('./routes/logout');
const joinRouter = require('./routes/join');
const mypageRouter = require('./routes/mypage');
const heartRouter = require('./routes/heart');
const qnaRouter = require('./routes/qna');
const rankingRouter = require('./routes/ranking');

const app = express();
app.set('port',process.env.PORT ||3000);

// 미들웨어
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extened:false}));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret : process.env.COOKIE_SECRET,
    cookie : {
        httpOnly : true,
        secure : false,
    },
    name : 'session-cookie',
    store : new MySQLStore({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT
    })
}))


// 라우터
app.use('/', indexRouter);
app.use('/login',loginRouter);
app.use('/logout',logoutRouter);
app.use('/join',joinRouter);
app.use('/mypage',mypageRouter);
app.use('/heart',heartRouter);
app.use('/qna', qnaRouter);
app.use('/rank',rankingRouter);

//모든 요청에 대해 다 실행
app.use((req,res,next)=>{
    res.status(404).send('Not Found');
});
app.use(function (err, req, res, next) {              
    console.error(err.stack)
    res.status(500).send('Something broke!')
});

app.listen(app.get('port'), ()=>{
    console.log(app.get('port'), '번 포트에서 대기 중');
})
