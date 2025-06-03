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

    router.get('/enter', (req, res) => {
        res.render('enter.ejs');
    });

    router.post('/save', async (req, res) => {
        try {
            console.log(req.body.title, req.body.content, req.body.someDate);
            await mydb.collection('post').insertOne({
                title: req.body.title,
                content: req.body.content,
                date: req.body.someDate,
                path: imagepath
            });
            console.log('데이터 추가 성공');
            res.redirect('/list');
        } catch (err) {
            console.error('❌ /save 에러:', err);
            res.status(500).send('저장 중 오류 발생');
        }
    });

    router.post('/photo', upload.single('picture'), function(req, res){
        console.log(req.file.path);
        imagepath = '/image/' + req.file.filename;
    });

module.exports = router;