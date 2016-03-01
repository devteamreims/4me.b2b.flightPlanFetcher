import express      from 'express';
import path         from 'path';
import cors from 'cors';
import logger       from 'morgan';
import bodyParser   from 'body-parser';
import io from 'socket.io';
import routes from './src/routes';

import makeStore from './src/store';

let app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

// Init socket.io
app.io = io();

// Init Redux Store
let store = makeStore(app.io);

// Pass down the store object
app.use('/', routes(store));

app.use((req, res, next) => {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.send({
      message: err.message,
      error: err
    });
  });
}

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    message: err.message,
    error: {}
  });
});



export default app;