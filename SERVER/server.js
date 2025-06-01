const express = require('express');
const app = express();

const { MongoClient, ObjectId } = require('mongodb');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const url = 'mongodb+srv://xxoyya:1234@cluster0.7clwbsq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

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

    // 📍 라우트 등록은 연결 이후에!
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

    app.listen(8080, () => {
      console.log("포트 8080으로 서버 대기중 ...");
    });
  })
  .catch(err => {
    console.error('❌ MongoDB 연결 실패:', err);
  });