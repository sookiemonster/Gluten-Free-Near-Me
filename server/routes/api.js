import express from 'express';
var router = express.Router();

let responseReady = async() => {
   // stub 
   return;
}

/* GET home page. */
router.post('/find-nearby', (req, res) => {
   console.log(req.body);
   responseReady()
      .then((val) => 
         res.send({ body: "Server responded (woah)"})
      )
});

export { router };
