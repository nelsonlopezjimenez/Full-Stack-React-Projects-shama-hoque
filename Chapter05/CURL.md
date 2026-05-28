# Sign in and save full response
curl -s -X POST http://localhost:5000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"testpassword"}' \
  -c cookies.txt        # ← saves cookie to file

# Pretty-print JSON (if jq installed)
curl -s -X POST http://localhost:5000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"testpassword"}' | jq .

# Extract just the token
TOKEN=$(curl -s -X POST http://localhost:5000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"testpassword"}' | jq -r .token)
echo $TOKEN

# Use token on a protected route (Bearer strategy)
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/users

# Use saved cookie instead (cookie strategy)
curl -b cookies.txt http://localhost:5000/api/users
