const express = require("express");
const app = express();
const cors = require("cors");
const bcrypt = require("bcrypt");

const session = require("express-session");
const MongoStore = require("connect-mongo");

require("dotenv").config({ path: "./config.env" });

const port = process.env.PORT;

// middle wear
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
    credentials: true,
    optionsSuccessStatus: 204,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
  session({
    secret: "keyboard cat",
    saveUninitialized: false,
    resave: false,
    store: MongoStore.create({
      mongoUrl: process.env.ATLAS_URI,
    }),
  })
);

const dbo = require("./db/conn");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(require("./routes/authentication"));
app.use(require("./routes/banking"));

app.listen(port, () => {
  dbo.connectToServer(function (err) {
    if (err) {
      console.err(err);
    }
  });
  console.log(`Server is running on port ${port}`);
});
