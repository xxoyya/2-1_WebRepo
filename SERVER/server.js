const mongoclient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const url = 'mongodb+srv://xxoyya:1234@cluster0.7clwbsq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const express = require('express');
const app = express();
let mydb;

mongoclient.connect(url)
    .then(client => {
        console.log('몽고DB 접속 성공');
        mydb = client.db('myboard');
    })

    //MYSQL + Node.js 접속 코드
    var mysql = require('mysql');
    var conn = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '1234',
        database: 'myboard',
    });

    conn.connect();

    // body-parser 라이브러리 추가
    const bodyParser = require('body-parser');
    const db = require('node-mysql/lib/db');app.use(bodyParser.urlencoded({ extended: true }));
    app.set('view engine', 'ejs');

    app.listen(8080, function(){
        console.log("포트 8080으로 서버 대기중 ...")
    });

    app.get('/list', function(req, res){
        // conn.query('SELECT * FROM post', function (err, rows, fields) {
        //     if (err) throw err;
        //     console.log(rows);
        // });
        mydb.collection('post').find().toArray(function(err, result){
            console.log(result);
            res.render('list.ejs', {data: result});
        });
    });

    // '/enter' 요청에 대한 처리 루틴
    app.get('/enter', function(req, res){
        res.render('enter.ejs');
    });

    app.post('/delete', function(req, res){
        console.log(req.body._id);
        req.body._id = new ObjectId(req.body._id);
    mydb.collection('post').deleteOne(req.body)
        .then(result =>{
            console.log('삭제완료');
            res.status(200).send();
        })
        .catch(err => {
            console.log(err);
            res.status(500).send();
        });
    });

    // '/save' 요청에 대한 post 처리 루틴
    app.post('/save', function(req, res){
        console.log(req.body.title);
        console.log(req.body.content);
        console.log(req.body.someDate);
        // 몽고 DB에 데이터 저장하기
        mydb.collection('post').insertOne(
            {title: req.body.title, content: req.body.content, date: req.body.someDate},
            ).then(result => {
                console.log(result);
                console.log('데이터 추가 성공');
            });
        // MYSQL에 데이터 저장하기
        // let sql = "insert into post (title, content, created) values (?, ?, NOW())";
        // let params = [req.body.title, req.body.content];
        // conn.query(sql, params, function(err, result){
        //     if(err) throw err;
        //     console.log('데이터 추가 성공');
        // });
        res.send('데이터 추가 성공');
    });