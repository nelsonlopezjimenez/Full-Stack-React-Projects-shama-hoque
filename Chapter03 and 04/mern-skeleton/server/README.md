# mern-skeleton — server

The JSON API of the MERN skeleton, built one stage at a time.
Read the lessons in order: [`lessons/`](lessons/).

## Run it

You need Node 22.9 or newer (`node -v`) and a running MongoDB.

```bash
cp .env.example .env   # then adjust MONGODB_URI if needed
npm install
npm run dev            # restarts by itself when you save a file
```

Then open `api.http` in VS Code (REST Client extension) and send the requests.

## Layout

```
server.js            connect to MongoDB (and wait for the indexes), then listen
express.js           middleware and routes
config/config.js     every environment variable in one place
routes/              URL → middleware chain (REST routes)
controllers/         request handlers
models/user.model.js the user schema
lessons/             one note per stage
api.http             requests to try (VS Code REST Client)
```
