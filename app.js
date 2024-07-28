// Register module alias for cleaner import paths
require('module-alias/register')

// Import required modules
const http = require('http')
const path = require('path')
const passport = require('./config') // Import configured passport
const session = require('express-session')
const express = require('express')
const socketio = require('socket.io')

// Create an Express application
const app = express()
// Create an HTTP server
const server = http.createServer(app)
// Attach Socket.io to the HTTP server
const io = socketio(server)

// Export io and app for use in other modules
module.exports = { io, app }

// Socket.io connection handler
io.on('connection', (socket) => {
  console.info('A client connected')
})

// Import application routes
const routes = require("./routes")

// Initialize the database connection
require("@lib/db")

// Import custom middleware to check DB connection
const { checkDBConnection } = require("@lib/middlewares")
const Channel = require('@models/Channel') // Import Channel model

// Middleware setup
// Set the directory for view templates
app.set('views', path.join(__dirname, 'views'))
// Set the view engine to EJS
app.set('view engine', 'ejs')

// Serve static files from the 'public' directory
app.use(express.static('public'))
// Parse JSON request bodies
app.use(express.json())
// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }))
// Set up session management with a secret key
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }))
// Initialize Passport for authentication
app.use(passport.initialize())
// Enable persistent login sessions
app.use(passport.session())
// Use custom middleware to check database connection
app.use(checkDBConnection)

// Middleware to attach user data to res.locals for views
app.use(async (req, res, next) => {
  res.locals.isCreateChannel = false
  if (req.user) {
    res.locals.channel = req.channel = req.user
  } else {
    req.channel = res.locals.channel = null
  }
  next()
})

// Use application routes
app.use("/", checkDBConnection, routes)

// 404 error handler for unknown routes
app.use((req, res) => {
  res.status(404).render('404')
})

// Set the port for the server
const port = 3000
// Start the server and listen on the specified port
server.listen(port, () => {
  console.info(`Server started at http://localhost:${port}`)
})
