var router = require('express').Router();

const { MongoClient, ObjectId } = require('mongodb');
const url = process.env.DB_URL;

const sha = require('sha256');

let cookieParser = require('cookie-parser');
let session = require('express-session');

router.use(cookieParser('ncvka0e398423kpfd'));
router.use(session({
    secret: 'dkufe8938493j4e08349u',
    resave: false,
    saveUninitialized: true
}));

router.get('/cookie', function(req, res){
    let milk = parseInt(req.signedCookies.milk) + 1000;
    if (isNaN(milk)) milk = 0;
    res.cookie('milk', milk, {signed: true});
    res.send('product: ' + milk + "원");
});

router.get('/session', function(req, res){
    if(isNaN(req.session.milk)) req.session.milk = 0;
    req.session.milk = req.session.milk + 1000;
    res.send("session: " + req.session.milk + "원");
});

let mydb;

MongoClient.connect(url)
    .then(client => {
        mydb = client.db('myboard');
    })
    .catch(err => {
        console.error('❌ /list DB 에러:', err);
    });

    router.get('/signup', function(req, res){
        res.render('signup.ejs');
    });
  
    router.post('/signup', async function(req, res){
        console.log(req.body.userid);
        console.log(req.body.userpw);
        console.log(req.body.usergroup);
        console.log(req.body.useremail);
        
        try {
          await mydb
            .collection("account")
            .insertOne({
              userid: req.body.userid,
              userpw: sha(req.body.userpw),
              usergroup: req.body.usergroup,
              useremail: req.body.useremail
            });
          console.log('회원가입 성공');
          res.redirect('/');
        } catch (err) {
          console.error('❌ /signup DB 에러:', err);
          res.status(500).send('회원가입 중 오류 발생');
        }
    });

    router.get('/login', function(req, res){
        console.log(req.session);
        if(req.session.user){
            console.log('세션 유지');
            res.render('index.ejs', {user: req.session.user});
        } else {
            res.render('login.ejs');
        }
    });

    router.post('/login', function(req, res){
        console.log("아이디: " +req.body.userid);
        console.log("비밀번호: " +req.body.userpw);
        
        mydb
          .collection("account")
          .findOne({userid: req.body.userid})
          .then(result => {
            if(result.userpw == sha(req.body.userpw)){
                req.session.user = req.body;
                console.log('새로운 로그인');
                res.render('index.ejs', {user: req.session.user});
            } else {
                res.render('login.ejs');
            }
        });
    });

    router.get('/logout', function(req, res){
        console.log("로그아웃");
        req.session.destroy();
        res.render('index.ejs', {user: null});
    });

module.exports = router;