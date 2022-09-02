
// express 사용을 위한 변수
const express = require('express'); // 설치한 라이브러리 첨부해
const app = express(); // 새로운 객체 만들어

// body-parser 사용선언
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));

// mongoDB 사용을 위한 변수
const MongoClient = require('mongodb').MongoClient;
const { ObjectId } = require('mongodb'); // objectId 쓰기위함

// method-override 사용선언
const methodOverride = require('method-override')
app.use(methodOverride('_method'))

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



// 패스포트, 세션 적용 준비
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

// app.use = 미들웨어를 쓰겠다
// 미들웨어 = 요청-응답 중간에 뭔가 실행되는 코드
app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

// passport를 활용한 인증
// 인증방식을 Local Strategy 라고 칭함
// 아이디랑 비번을 입력하면 이를 정의
passport.use(new LocalStrategy({
    usernameField: 'id', // 아이디의 네임
    passwordField: 'pw', // 비번의 네임
    session: true, // 세션으로 저장할건지
    passReqToCallback: false,
  }, function (입력한아이디, 입력한비번, done) {
    //console.log(입력한아이디, 입력한비번);
    db.collection('member').findOne({ id: 입력한아이디 }, function (에러, 결과) { // 디비에 입력 데이터가 있는지 찾기
      if (에러) return done(에러) // 에러처리
  
      if (!결과) return done(null, false, { message: '존재하지않는 아이디요' }) // 디비에 아이디가 없는 경우
      if (입력한비번 == 결과.pw) { // 비번까지 맞는 경우
        return done(null, 결과)
      } else { // 비번이 틀린 경우
        return done(null, false, { message: '비번틀렸어요' })
      }
    })
  }));

  
  // 로그인 성공 시 세션 부여
  passport.serializeUser(function(user, done){
    done(null, user.id) // user.id라는 걸로 세션을 만든다
  });
  // 이 세션 데이터를 가진 사람을 DB에서 찾아줘(마이페이지 접속 시 발동)
  passport.deserializeUser(function(아이디, done){ // 여기서 아이디는 위의 user.id
    // 디비에서 위에있는 user.id로 유저를 찾은 뒤 유저정보를 아래에 뱉어 넣음
    db.collection('member').findOne({id : 아이디}, function(error, result){
        done(null, result)
    })
  });


// 로그인 페이지
app.get('/login', function(request, response){
    response.render("login.ejs")
});

// 로그인 처리
app.post('/login', passport.authenticate('local', { // 로컬인지 확인해줘
    failureRedirect : '/fail' // 인증 실패하면 여기로 이동해줘
}), function(request, response){ // 성공한 경우 실행
    response.redirect('/')
});


// 실패했을 때
app.get('/fail', function(request, response){
    response.render('fail.ejs')
})


// 로그인 확인 미들웨어
function 로그인했니(request ,response, next){ // 적용할 미들웨어
    if(request.user){ // 이사람이 로그인한 상대명 request.user가 달라붙어 있다
        next()
    }else{
        response.send('로그인이 안되어있습니다')
    }
}


// 회원가입 페이지
app.get('/register', function(request, response){
    response.render("register.ejs")
});

// 회원가입 처리
app.post('/register', function(request, response){
    db.collection('member').insertOne( { id : request.body.id, pw : request.body.pw, win : 0, total : 0}, function(error, result){
        response.redirect('/')
        console.log('성공')
    });
});






