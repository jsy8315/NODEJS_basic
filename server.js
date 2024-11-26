const express = require('express')
const app = express()
const methodOverride = require('method-override')   // method override 라이브러리 사용하기 위해 추가

app.use(methodOverride('_method'))  // method override 라이브러리 사용하기 위해 추가

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');  // ejs 사용하기 위한 세팅

app.use(express.json()) // 데이터를 보내면 요청.body에서 확인하기 위해 필요
app.use(express.urlencoded({extended:true})) // 데이터를 보내면 요청.body에서 확인하기 위해 필요

const { MongoClient, ObjectId } = require('mongodb')

let db
const url = 'mongodb+srv://admin:rashow204952!@cluster0.olyln.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
new MongoClient(url).connect().then((client)=>{
  console.log('DB연결성공')
  db = client.db('forum');

  // db안에다가 listen을 적어놓는게 좋다
  app.listen(8080, () => {
      console.log('http://localhost:8080 에서 서버실행중ㅋ')
  })
  
}).catch((err)=>{
  console.log(err)
})


app.get('/', (요청, 응답) => {
    응답.sendFile(__dirname + '/index.html');
})

app.get('/news', (요청, 응답) => {
    db.collection('post').insertOne({title: 'Big Bird', content: '뺏는건 너무하지 않습니까 수원FC'})
    // 응답.send('뉴스ㅎ')
})

app.get('/shop', (요청, 응답) => {
    응답.send('쇼핑페이지입니다만')
})

// 1.shop 접속 시 app.get() 함수 실행됨
// 2. 그 다음 콜백함수 실행됨

app.get('/list', async (요청, 응답) => {
    let result = await db.collection('post').find().toArray() // DB post에 있는 데이터를 가지고 와버렷
    // 응답.send(result[0].title); // 응답은 1개만 가능

    응답.render('list.ejs', { posts : result});
})

app.get('/time', async (요청, 응답) => {
    let dateNow = new Date();
    응답.render('time.ejs', { dateNow : dateNow});
})

// 글 작성 기능?
// 1. 글 작성 페이지에서 글써서 서버로
// 2. 서버는 글을 검사
// 3. 이상없으면 DB에 ㄱㄱ
app.get('/write', (요청, 응답) => {
    응답.render('write.ejs');
})

app.post('/add', async(요청, 응답) => {
    console.log(요청.body);
    let reqTitle = 요청.body.title;
    let reqContent = 요청.body.content;

    try {
    // 이런 검증 html안에서 script열어서 해도될듯? -> 포론트 코드는 위조 ㄱㄴ, 그래서 마지막 검증은 서버에서 ㄱㄱ
    if (reqTitle == '') {
        응답.send('제목입력안했는데?');
    } else {
        await db.collection('post').insertOne({title: reqTitle, content: reqContent});
        응답.redirect('/list');
    } 
    } catch(e) {
        console.log(e);
        응답.status(500).send('서버에 에러남요');
    }
})

// /detail/:aaaa  aaaa아무거나로 접속한 다음 요청.params.aaaa로 받으면 됨
app.get('/detail/:id', async(요청, 응답) => {
    try {
        // posts란 이름의 DB중에  {}가 기재되어 있는걸 가져옴
        let result = await db.collection('post').findOne({ _id : new ObjectId( 요청.params.id ) });
        console.log(result);
        응답.render('detail.ejs', { postOne : result});
        if (result == null) {
            console.log(e)
            응답.status(404).send('이상한 url 입력함...심심하니?');    
        }
    } catch(e) {
        console.log(e)
        응답.status(404).send('이상한 url 입력함...심심하니?');
    }
})

// 수정 기능 만들기
app.get('/edit/:id', async(요청, 응답) => {
    try {
        // posts란 이름의 DB중에  {}가 기재되어 있는걸 가져옴
        let result = await db.collection('post').findOne({ _id : new ObjectId( 요청.params.id ) });
        console.log(result);
        응답.render('edit.ejs', { postOne : result});
        if (result == null) {
            console.log(e)
            응답.status(404).send('이상한 url 입력함...심심하니?');    
        }
    } catch(e) {
        console.log(e)
        응답.status(404).send('이상한 url 입력함...심심하니?');
    }
})

app.put('/addEdit', async(요청, 응답) => {
    console.log(요청.body);
    let reqId = 요청.body._id;
    let reqTitle = 요청.body.title;
    let reqContent = 요청.body.content;

    try {
        if (reqTitle == '') {
            응답.send('제목입력안했는데?');
        } else {
            await db.collection('post').updateOne({_id : new ObjectId(reqId)}, {$set: {title: reqTitle, content: reqContent}});
            응답.redirect('/list');
        } 
    } catch(e) {
        console.log(e);
        응답.status(500).send('서버에 에러남요');
    }
})

app.put('/addLike', async(요청, 응답) => {
    try {
        await db.collection('post').updateOne({_id : 1}, {$inc: {like : 1}});
        응답.redirect('/list');

    } catch(e) {
        응답.status(404).send('이상한 url 입력함...심심하니?');
    }
})

// 삭제기능만들기
// URL 파라미터 이용해서 데이터 보내기
app.post('/delete01', async(요청, 응답) => {
    console.log(요청.body);
})

// URL 파라미터 이용해서 데이터 보내기
app.get('/delete02/:name', async(요청, 응답) => {
    console.log(요청.params.name);
})

// query string 써도 서버로 데이터 전송가능
app.get('/delete03', async(요청, 응답) => {
    console.log(요청.query);
    await db.collection('post').deleteOne({_id : new ObjectId(요청.query.postId)});
    응답.send('삭제완료');
})
