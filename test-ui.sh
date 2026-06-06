node dist/pars.js serve &
SERVER_PID=$!
sleep 2

curl -s -X POST http://localhost:3333/api/chat -H "Content-Type: application/json" -d '{"query": "hello"}' | head -c 100
echo -e "\n---"
curl -s -X POST http://localhost:3333/api/close -H "Content-Type: application/json" | head -c 100
echo -e "\n---"

kill $SERVER_PID
