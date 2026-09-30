import path from 'node:path'
import express from 'express'
import { MongoClient } from 'mongodb'

const port = process.env.PORT || 3000
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mernSimpleSetup?directConnection=true'
// The client is a separate project; the server only needs to know where its build output lives.
const clientDist = path.resolve(import.meta.dirname, process.env.CLIENT_DIST || '../client/dist')

const app = express()

app.get('/hello', (req, res) => {
  res.send("HELLO WORLD!!!")
})

// Built React app (client/dist, produced by `vite build`). The HTML comes from Vite's index.html.
app.use(express.static(clientDist))

// Any other GET returns the React app's index.html. Must stay after the API routes.
// Paths with a file extension (e.g. a missing /assets/x.js) get a real 404 instead of HTML.
app.get('/{*splat}', (req, res, next) => {
  if (path.extname(req.path)) return next()
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err && !res.headersSent) {
      res.status(404).send('Client not built. Run `npm run build` in ../client, or use the Vite dev server at http://localhost:5173')
    }
  })
})

app.listen(port, (err) => {
  if (err) {
    console.error(err)
    return
  }
  console.info('Server started on port %s.', port)
})

// Database connection check
const client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 5000 })
try {
  await client.connect()
  console.info('Connected successfully to mongodb server')
} catch (err) {
  console.error('MongoDB connection failed: %s', err.message)
} finally {
  await client.close()
}
