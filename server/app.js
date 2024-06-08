import express from 'express';
import path from 'path';
import cors from 'cors';

import { Server } from 'socket.io';
import { createServer } from 'node:http';

import { router as indexRouter } from './routes/index.js';
import { router as apiRouter } from './routes/api.js';
import { Emitter } from './socket-handler.js';

const SERVER_PORT = 5000;
const CLIENT_PORT = 3000;

const app = express();
// Allow fetch from client
app.use(cors({origin: `http://localhost:${CLIENT_PORT}`}));
const server = createServer(app);
const io = new Server(server, cors(
  { origin: `http://localhost:${CLIENT_PORT}`, 
    methods: ["GET", "POST"]
  }
));

const emitter = new Emitter(app, io);

app.use(express.json());


// app.use(express.static(path.join(__dirname, 'public')));

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
  emitter.broadcastRestaurant("hi!");
});

server.listen(SERVER_PORT, (err) => {
  if (err) console.log("Error in server setup")
    console.log(`Server listening on http://localhost:${SERVER_PORT}`);
})
export { app, emitter };
