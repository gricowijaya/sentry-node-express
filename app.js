// or using CommonJS
require('dotenv').config();
const express = require('express');
const Sentry = require('@sentry/node');
const Tracing = require("@sentry/tracing");
const router = require('./routes/')
const morgan = require('morgan');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const {
    PORT,
    ENV
} = process.env

const app = express();

Sentry.init({
  // unique dsn we will use
  dsn: "https://998d64fab9e542f8a582269263bad347@o4504071404126208.ingest.sentry.io/4504071406813184",
  // environment we used
  environment: ENV,
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app }),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler());

// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

// logging for morgan
app.use(morgan('dev'));

app.use(express.json());
app.use(methodOverride());
app.use(bodyParser({keepExtensions:true}));
// All controllers should live here
app.get("/", function rootHandler(req, res) {
  res.end("Hello world!");
});

// testing endpoint for error logging
app.get("/testing-sentry-error", (req, res, next) => { 
    try { 
        res.send(data); // let's test without the data first
    } catch(err) { 
        throw new Error(err);
    }
});

// testing endpoint for ok logging
app.get("/testing-sentry-ok", (req, res, next) => { 
    try { 
        const data = {
            name: "rico",
            kelas: "bejs"
        }
        res.send(data); // let's test without the data first
    } catch(err) { 
        throw new Error(err);
    }
});

// The error handler must be before any other error middleware and after all controllers
// The Handlers that will send the error into the sentry webpage.
app.use(Sentry.Handlers.errorHandler());

// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  // res.statusCode = 500;
  // res.end(res.sentry + "\n");
    return res.status(500).json({
        status: "false",
        message: err.message,
        data: null
    });
});

app.use(router);


// to get the image so we can get the static file from the public images
app.use('/images', express.static('./public/images'));

app.listen(PORT, () => { console.log(`PORT ${PORT}`)});
