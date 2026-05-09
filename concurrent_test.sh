#!/bin/bash
echo "Starting Spring Boot app..."
./gradlew bootRun > app_concurrent.log 2>&1 &
APP_PID=$!

echo "Waiting for app to start on port 8080..."
while ! nc -z localhost 8080; do
  sleep 1
done
echo "App started!"

echo "1. Create Post"
curl -s -X POST http://localhost:8080/posts/new -H "Content-Type: application/json" -d '{"question":"Concurrent Test", "category":"ETC", "endDate":"2026-12-31"}'

echo "2. Get Post ID"
POST_ID=$(curl -s http://localhost:8080/posts | grep -o '"id":[0-9]*' | head -1 | awk -F: '{print $2}')
echo "Post ID is $POST_ID"

echo "3. Sending 50 concurrent PUT requests (simulate 50 different users voting Agree)..."
for i in {1..50}; do
  curl -s -X PUT http://localhost:8080/posts/$POST_ID/vote \
       -H "Content-Type: application/json" \
       -H "X-Forwarded-For: 10.0.0.$i" \
       -d 'true' &
done

# Wait for all background processes to finish
wait

echo ""
echo "All 50 concurrent requests finished."

echo "4. Verify Agree count (Expected: 50)"
curl -s http://localhost:8080/posts | jq '.content[0]'

echo "Stopping app..."
kill $APP_PID
