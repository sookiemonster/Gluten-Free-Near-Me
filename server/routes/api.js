import express from 'express';
var router = express.Router();

/* GET home page. */
router.post('/find-nearby', (req, res) => {
   console.log(req.body);
   responseReady()
      .then((res) => res.send(
         res.send({ body: "Server responded (woah)"})
      ))
});

export { router };
