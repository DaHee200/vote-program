#!/bin/bash
echo "Starting Spring Boot app..."
./gradlew bootRun > app.log 2>&1 &
APP_PID=$!

echo "Waiting for app to start on port 8080..."
while ! nc -z localhost 8080; do
  sleep 1
done
echo "App started!"

echo "1. Create Post"
curl -s -X POST http://localhost:8080/posts/new -H "Content-Type: application/json" -d '{"question":"Kotlin vs Java", "category":"ETC", "endDate":"2026-12-31"}'

echo "2. Get Posts"
POST_ID=$(curl -s http://localhost:8080/posts | grep -o '"id":[0-9]*' | head -1 | awk -F: '{print $2}')
echo "Post ID is $POST_ID"

echo "3. Vote Agree (PUT)"
curl -s -X PUT http://localhost:8080/posts/$POST_ID/vote -H "Content-Type: application/json" -d 'true'

echo "4. Get Posts to verify Agree count"
curl -s http://localhost:8080/posts | jq '.content[0]'

echo "5. Vote Disagree (PUT) - Change vote"
curl -s -X PUT http://localhost:8080/posts/$POST_ID/vote -H "Content-Type: application/json" -d 'false'

echo "6. Get Posts to verify Disagree count"
curl -s http://localhost:8080/posts | jq '.content[0]'

echo "7. Cancel Vote (DELETE)"
curl -s -X DELETE http://localhost:8080/posts/$POST_ID/vote

echo "8. Get Posts to verify Cancellation"
curl -s http://localhost:8080/posts | jq '.content[0]'

echo "9. Test Rate Limit (Sending 5 requests fast)"
for i in {1..5}; do
  curl -s -o /dev/null -w "Req $i Status: %{http_code}\n" -X PUT http://localhost:8080/posts/$POST_ID/vote -H "Content-Type: application/json" -d 'true'
done
echo "6th Request should fail with 429:"
curl -s -w "\nStatus: %{http_code}\n" -X PUT http://localhost:8080/posts/$POST_ID/vote -H "Content-Type: application/json" -d 'true'

echo "Stopping app..."
kill $APP_PID
