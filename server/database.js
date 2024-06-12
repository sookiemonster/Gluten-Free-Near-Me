import pg from 'pg';
import 'dotenv/config';
const { Pool } = pg;

// Destructure environment variable to store Postgre data
let { ENDPOINT_ID } = process.env;

let pool = new Pool({
   ssl: true
});

// async function getPgVersion() {
//    const result = await client.query('select version()');
//    console.log(result);
//  }

// pool.connect((err, client, done) => {
//    client.query("select version();")
//    done();
// });

pool.query("SELECT version();")
   .then((result) => console.log(result));

//  .then(getPgVersion());
