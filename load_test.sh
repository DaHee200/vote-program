#!/bin/bash

# 사용법: ./load_test.sh [인원수]
USERS=${1:-50}
PORT=8080

echo "==========================================="
echo "🚀 부하 테스트 시작 (동시 접속자: $USERS 명)"
echo "==========================================="

if ! nc -z localhost $PORT; then
    echo "❌ 에러: 서버가 $PORT 포트에서 실행 중이지 않습니다."
    exit 1
fi

echo "1. 테스트용 포스트 생성 중..."
curl -s -X POST http://localhost:$PORT/posts/new \
    -H "Content-Type: application/json" \
    -d "{\"question\":\"Load Test - $USERS Users\", \"category\":\"ETC\", \"endDate\":\"2026-12-31\"}"

POST_ID=$(curl -s http://localhost:$PORT/posts | jq '.content[0].id')
echo "👉 대상 포스트 ID: $POST_ID"

echo "2. $USERS 개의 동시 요청 발송 중..."
START_TIME=$(python3 -c "import time; print(int(time.time()*1000))")

RESULT_FILE="test_results.tmp"
> $RESULT_FILE

for i in $(seq 1 $USERS); do
    curl -s -o /dev/null -w "%{http_code}\n" \
         -X PUT http://localhost:$PORT/posts/$POST_ID/vote \
         -H "Content-Type: application/json" \
         -H "X-Forwarded-For: 10.10.$((i/256)).$((i%256))" \
         -d 'true' >> $RESULT_FILE &
done

wait
END_TIME=$(python3 -c "import time; print(int(time.time()*1000))")
DURATION=$((END_TIME - START_TIME))

SUCCESS=$(grep -c "200" $RESULT_FILE)
FAILURE=$(grep -v "200" $RESULT_FILE | wc -l)
rm $RESULT_FILE

echo "-------------------------------------------"
echo "📊 테스트 결과 요약"
echo "⏱️ 소요 시간: ${DURATION}ms"
echo "✅ 성공 (200 OK): $SUCCESS 건"
echo "❌ 실패: $FAILURE 건"

echo "-------------------------------------------"
echo "🔍 데이터 정합성 검증"
FINAL_DATA=$(curl -s http://localhost:$PORT/posts | jq ".content[] | select(.id == $POST_ID)")
ACTUAL_COUNT=$(echo $FINAL_DATA | jq '.agreeCount')

echo "예상 카운트: $USERS"
echo "실제 카운트: $ACTUAL_COUNT"

if [ "$USERS" -eq "$ACTUAL_COUNT" ]; then
    echo "결과: 🎉 PASS! (정합성 완벽)"
else
    echo "결과: ⚠️ FAIL! (유실 발생)"
fi
echo "===========================================" 
