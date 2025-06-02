const express = require('express');
const app = express();
const sha = require('sha256');

const { MongoClient, ObjectId } = require('mongodb');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const url = 'mongodb+srv://xxoyya:1234@cluster0.7clwbsq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// 정적 파일 라이브러리 추가
app.use(express.static('public'));

let cookieParser = require('cookie-parser');
let session = require('express-session');

app.use(cookieParser('ncvka0e398423kpfd'));

app.use(session({
  secret: 'dkufe8938493j4e08349u',
  resave: false,
  saveUninitialized: true
}))

// MySQL 연결
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'myboard',
});
conn.connect();

let mydb;

// MongoDB 연결 + 서버 및 라우터 등록
MongoClient.connect(url)
  .then(client => {
    console.log('몽고DB 접속 성공');
    mydb = client.db('myboard');

    app.get('/list', async (req, res) => {
      try {
        const result = await mydb.collection('post').find().toArray();
        console.log(result);
        res.render('list.ejs', { data: result });
      } catch (err) {
        console.error('❌ /list DB 에러:', err);
        res.status(500).send('DB 오류');
      }
    });

    app.get('/enter', (req, res) => {
        res.render('enter.ejs');
    });

    app.post('/save', async (req, res) => {
      try {
        console.log(req.body.title, req.body.content, req.body.someDate);
        await mydb.collection('post').insertOne({
            title: req.body.title,
            content: req.body.content,
            date: req.body.someDate,
        });
        console.log('데이터 추가 성공');
        res.redirect('/list');
      } catch (err) {
        console.error('❌ /save 에러:', err);
        res.status(500).send('저장 중 오류 발생');
      }
      res.redirect('/list');
    });

    app.post('/delete', async (req, res) => {
      try {
        const id = new ObjectId(req.body._id);
        await mydb.collection('post').deleteOne({ _id: id });
        console.log('삭제 완료');
        res.sendStatus(200);
      } catch (err) {
        console.error('❌ /delete 에러:', err);
        res.sendStatus(500);
      }
    });

    app.get('/content/:id', function(req, res){
        console.log(req.params.id);
        req.params.id = new ObjectId(req.params.id);
        mydb
            .collection('post')
            .findOne({_id: req.params.id})
            .then(result => {
                console.log(result);
                res.render('content.ejs', {data: result});
            });
    });

    app.get('/edit/:id', function(req, res){
        req.params.id = new ObjectId(req.params.id);
        mydb
            .collection('post')
            .findOne({_id: req.params.id})
            .then(result => {
                console.log(result);
                res.render('edit.ejs', {data: result});
            });
    });

    app.post('/edit', async (req, res) => {
        try {
            const id = new ObjectId(req.body.id);
            await mydb.collection('post').updateOne({_id: id}, {$set: {
                title: req.body.title,
                content: req.body.content,
                date: req.body.someDate,
            }});
            console.log('수정 완료');
            res.redirect('/list');
        } catch (err) {
            console.error('❌ /edit 에러:', err);
            res.status(500).send('수정 중 오류 발생');
        }
    });

    app.get('/cookie', function(req, res){
      let milk = parseInt(req.signedCookies.milk) + 1000;
      if (isNaN(milk)) milk = 0;
      res.cookie('milk', milk, {signed: true});
      res.send('product: ' + milk + "원");
    });

    app.get('/session', function(req, res){
      if(isNaN(req.session.milk)) req.session.milk = 0;
      req.session.milk = req.session.milk + 1000;
      res.send("session: " + req.session.milk + "원");
    })

    app.get('/login', function(req, res){
      console.log(req.session);
      if(req.session.user){
        console.log('세션 유지');
        res.render('index.ejs', {user: req.session.user});
      } else {
        res.render('login.ejs');
      }
    });

    app.post('/login', function(req, res){
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

    app.get('/logout', function(req, res){
      console.log("로그아웃");
      req.session.destroy();
      res.render('index.ejs', {user: null});
    });

    app.get('/signup', function(req, res){
      res.render('signup.ejs');
    });

    app.post('/signup', async function(req, res){
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

    app.get("/", function(req, res){
        // res.render('index.ejs');
        if(req.session.user){
          res.render('index.ejs', {user: req.session.user});
        } else {
          console.log("user: null");
          res.render('index.ejs', {user: null});
        }
    });

    app.listen(8080, () => {
        console.log("포트 8080으로 서버 대기중 ...");
    });
  })
  .catch(err => {
    console.error('❌ MongoDB 연결 실패:', err);
  });