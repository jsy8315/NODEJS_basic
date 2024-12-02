const router = require('express').Router()
// 라우터 -> 안내하는 기계
router.get('/shop/shirts', (요청, 응답) => {
   응답.send('셔츠 파는 페이지입니다')
})

router.get('/shop/pants', (요청, 응답) => {
   응답.send('바지 파는 페이지입니다')
})

module.exports = router 