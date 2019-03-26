curl -d "{ \"deviceId\": \"$1\" }" -H "Content-Type: application/json" -X POST http://localhost:8001/register-device
