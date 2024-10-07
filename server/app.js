import express from 'express';
import path from 'path';
import cors from 'cors';

import { Server } from 'socket.io';
// import { createServer } from 'node:https';
import * as fs from 'node:fs';
import { createServer } from 'node:http';

import { router as indexRouter } from './routes/index.js';
import { router as apiRouter } from './routes/api.js';
import { Emitter } from './emitter.js';
import { Database } from './database.js';

const SERVER_PORT = 5000;
const CLIENT_PORT = 3000;
const SERVER_URL = `http://localhost:${SERVER_PORT}`
const CLIENT_URL = `http://localhost:${CLIENT_PORT}`

// const httpsOptions = {
//   key: fs.readFileSync('localhost.key').toString(),
//   cert: fs.readFileSync('localhost.pem').toString()
// };

const app = express();
// Allow fetch from client
app.use(cors({origin: CLIENT_URL}));

// const server = createServer(httpsOptions, app);
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"]  
  }
});

io.engine.on("connection_error", (err) => {
  console.log(err.req);      // the request object
  console.log(err.code);     // the error code, for example 1
  console.log(err.message);  // the error message, for example "Session ID unknown"
  console.log(err.context);  // some additional error context
});

const appEmitter = new Emitter(app, io);
const db = new Database();

app.use(express.json());
app.use('/', indexRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send(err);
  // res.render('error');
});

io.on('connection', (socket) => {
  console.log('user connected');
  // appEmitter.broadcastRestaurant("hi!");
});

server.listen(SERVER_PORT, (err) => {
  if (err) console.log("Error in server setup")
    console.log(`Server listening on ${SERVER_URL}`);
})
export { app, appEmitter, db };