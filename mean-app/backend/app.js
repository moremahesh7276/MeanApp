const express = require("express");
const bodyParser = require("body-parser");

const path = require("path");
const postRoutes = require("./routes/posts");
const userRoutes = require("./routes/user");
const mongoose = require("mongoose");


mongoose.connect('mongodb+srv://moremahesh7276:moremahesh7276@cluster0-l0i3w.mongodb.net/node-angular?retryWrites=true', {
    useNewUrlParser: true
  })
  .then(() => {
    console.log("connected to mongoDB");
  })
  .catch((error) => {
    console.log(error);
  });

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use('/images',express.static(path.join('backend/images')))

app.use((req, res, next) => {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  next();
});

app.use("/api/posts",postRoutes);
app.use("/api/user",userRoutes);


module.exports = app;
