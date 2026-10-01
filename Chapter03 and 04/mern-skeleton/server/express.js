import express from 'express'
import userRoutes from './routes/user.routes.js'

// [BEGINNER] This file only *builds* the app and exports it. server.js is the file that
// starts it (connects to the DB, calls listen). Keeping them apart lets tests import the
// app without opening a port or a database connection.
const app = express()

// parse body params and attach them to req.body
// [BEGINNER] Middleware: a function that runs for EVERY request, before the routes.
// express.json() reads a JSON request body (Content-Type: application/json) and puts the
// parsed object in req.body. Without it, req.body is undefined.
app.use(express.json())

// mount routes
// [BEGINNER] Every route for /api/users is defined in routes/user.routes.js. app.use() plugs the
// whole router into the app. To find "what happens on PATCH /api/users/:id", open the routes file.
app.use('/', userRoutes)

export default app
