
// express 사용을 위한 변수
const express = require('express'); // 설치한 라이브러리 첨부해
const app = express(); // 새로운 객체 만들어

// body-parser 사용선언
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));

// mongoDB 사용을 위한 변수
const MongoClient = require('mongodb').MongoClient;
const { ObjectId } = require('mongodb'); // objectId 쓰기위함


// ejs 사용선언
app.set('view engine', 'ejs');

// public을 스태틱으로
app.use('/public', express.static('public'));

// 환경변수를 위한 라이브러리 .env
require('dotenv').config()

// mongoDB 사용선언
var db;
MongoClient.connect(process.env.DB_URL, { useUnifiedTopology: true }, function(에러, client){ // DB 커넥팅이 완료되면 서버 띄워
    if(에러) return console.log(에러) // 에러 뜨면 원인 콘솔에 띄우기

    db = client.db('speed_word'); // todoapp이라는 폴더(database)에 연결해

    // db.collection('post').insertOne( {이름 : 'john', _id : 20} , function(에러, 결과){
    //     console.log('저장완료');
    // });

    // 서버로 어디로 열지(서버포트, 뭐할지)
    app.listen(8081, function(){
        console.log('listening on 8081')
    });

});




// 요청에 대한 처리

// 누가 슬래시 경로로 오면 index로 보내줘
app.get('/', function(request, response){
    response.render("index.ejs")
});

// 회원가입 요청처리
app.post