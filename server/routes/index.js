import express from 'express';
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("index accessed")
  res.send("Index!");
});

export { router };
