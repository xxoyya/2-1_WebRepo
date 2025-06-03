const express = require('express');
const app = express();
const sha = require('sha256');
const dotenv = require('dotenv').config();

const { MongoClient, ObjectId } = require('mongodb');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const url = process.env.DB_URL;

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// 정적 파일 라이브러리 추가
app.use(express.static('public'));

app.use('/', require('./routes/post.js'));
app.use('/', require('./routes/add.js'));
app.use('/', require('./routes/auth.js'));

let multer = require('multer');

let storage = multer.diskStorage({
  destination: function(req, file, done){
    done(null, './public/image');
  },
  filename: function(req, file, done){
    done(null, file.originalname);
  }
});

let upload = multer({storage: storage});
let imagepath = '';

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

    app.get('/search', function(req, res){
      console.log(req.query);
      mydb
        .collection('post')
        .find({title: req.query.value}).toArray()
        .then(result => {
          console.log(result);
          res.render('sresult.ejs', {data: result});
      });
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

    app.listen(process.env.PORT, () => {
        console.log("포트 8080으로 서버 대기중 ...");
    });
  })
  .catch(err => {
    console.error('❌ MongoDB 연결 실패:', err);
  });