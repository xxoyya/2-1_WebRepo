var router = require('express').Router();

const { MongoClient, ObjectId } = require('mongodb');
const url = process.env.DB_URL;

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

let mydb;

MongoClient.connect(url)
    .then(client => {
        mydb = client.db('myboard');
    })
    .catch(err => {
        console.error('❌ /list DB 에러:', err);
    });

    router.get('/list', async (req, res) => {
        try {
            const result = await mydb.collection('post').find().toArray();
            console.log(result);
            res.render('list.ejs', { data: result });
        } catch (err) {
            console.error('❌ /list DB 에러:', err);
            res.status(500).send('DB 오류');
        }
    });

    router.post('/delete', async (req, res) => {
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
  
    router.get('/content/:id', function(req, res){
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
  
    router.get('/edit/:id', function(req, res){
        req.params.id = new ObjectId(req.params.id);
        mydb
            .collection('post')
            .findOne({_id: req.params.id})
            .then(result => {
                console.log(result);
                res.render('edit.ejs', {data: result});
        });
    });

    router.post('/edit', async (req, res) => {
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

module.exports = router;