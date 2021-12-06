const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const app = express();
const $ = require('jquery');

const { Pool } = require("pg");
const { post } = require('jquery');

const credentials = {
  user: "child_care_admin",
  host: "localhost",
  database: "child_care_regulated_programs",
  password: "child_care",
  port: 5432,
};

// Connecting to Postgres DB

var fac_name = '';
var loggedInUser = '';

app.set('view engine', 'ejs');

var db = null;

var connectionString = 'mongodb+srv://shlokshah18:qwerty123@shlokscluster.lhxvc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

app.use(bodyParser.urlencoded({ extended: true }))

MongoClient.connect(connectionString, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to Mongo Database')
    db = client.db('ChildWelfare')
  })


app.get('/', (req, res) => {
  res.render('login.ejs', { facility_data: {} });
})

app.post('/', async (req, res) => {
  loggedInUser = req.body.username

  const pool = new Pool(credentials);

  // Query Execution for inserting User Id in user_info table
  pool.query({
    text: "INSERT INTO user_info VALUES($1,'guest_user') ON CONFLICT (userid) DO NOTHING",
    values: [`${loggedInUser}`]
  }).then()

  res.render('index.ejs', { username: req.body.username, facility_data: {} });
})

app.get('/facname', (req, res) => {
  res.render('index.ejs', { username: loggedInUser, facility_data: {} });
});

app.post('/facname', async (req, res) => {
  var query = '';
  var curr_time = new Date();
  var timeInUTC = curr_time.toUTCString();

  fac_name = req.body.facility_name1;

  const pool = new Pool(credentials);

  // Query Execution for inserting logging data in the log_table table when user searched a facility name
  pool.query({
    text: "INSERT INTO log_table VALUES "+
    `($1, '${credentials.database}', 'facility,program_type,facility_location', `+
    `'facility_name', '${timeInUTC}')`,
    values: [`${loggedInUser}`]
  }).then()


// Query Execution for getting the data for all facilities matching with the searched keyword
  pool.query({ 
    text: "SELECT * FROM facility f INNER JOIN program_type p ON f.program_type = p.program_type "+
    "INNER JOIN facility_location fl ON f.facility_name = fl.facility_name WHERE f.facility_name "+
    "ILIKE $1", 
    values: [`%${req.body.facility_name1}%`]
 }).then(results => {
    res.render('index.ejs', { username: loggedInUser, facility_data: results.rows })
  })

});

app.post('/filter', (req, res) => {

  var curr_time = new Date();
  var timeInUTC = curr_time.toUTCString();
  
  var userInfoQuery = `INSERT INTO log_table VALUES ('${loggedInUser}', '${credentials.database}',`+
                      ` 'facility,program_type,facility_location',` +
                      ` '${req.body.program_type}, ${req.body.facility_status}, ${req.body.county}',`+
                      ` '${timeInUTC}')`;
  
  var query = `SELECT * FROM facility f INNER JOIN program_type p ON f.program_type = p.program_type ` +
    `INNER JOIN facility_location fl ON f.facility_name = fl.facility_name WHERE f.facility_name ` +
    `ILIKE '%${fac_name}%'`;

  if (req.body.program_type !== '') {
    query = query + ` AND f.program_type = '${req.body.program_type}'`
  }
  if (req.body.facility_status !== '') {
    query = query + ` AND f.facility_status = '${req.body.facility_status}'`
  }
  if (req.body.county !== '') {
    query = query + ` AND fl.county = '${req.body.county}'`
  }

  const pool = new Pool(credentials);

  // Query Execution for logging the user acitivty when user filters the given data based on some parameters
  pool.query(userInfoQuery, (error, results) => {
    if (error) {
      throw error
    }
  })

  // Query Execution for getting the data after user has entered values to be filtered
  pool.query({ 
    text: query + " AND fl.city ILIKE $1", 
    values: [`%${req.body.city}%`]
 }).then(results => {
    res.render('index.ejs', { username: loggedInUser, facility_data: results.rows })
  })

})

app.get('/details/:facility_id', async (req, res) => {

  const pool = new Pool(credentials);

  var sqlQuery = `SELECT facility_name, capacity_description, ` +
    `SUM (infant_capacity + toddler_capacity + preschool_capacity + school_age_capacity) as Total_Capacity ` +
    `FROM capacity ` +
    `WHERE facility_id = '${req.params.facility_id}' ` +
    `GROUP BY facility_id, facility_name, capacity_description`

  var capacity_data;
  var facility_data;
  var mongo_data = [];

  var getFacilityInfoQuery = `SELECT * FROM facility f ` +
    `INNER JOIN program_type p ON f.program_type = p.program_type ` +
    `INNER JOIN facility_location fl ON f.facility_name = fl.facility_name ` +
    `WHERE f.facility_id = '${req.params.facility_id}' ` +
    `LIMIT 1`

  // Queries execution to get the data of the selected facility
    // Getting the data of the selected facility's zipcode from the MongoDB database
    // MongoDB returns the data of various Welfare Programs in the selected database
    await pool.query(sqlQuery)
    .then(async (res) => {
      capacity_data = res.rows
      await pool.query(getFacilityInfoQuery)
        .then(async (results) => {
          facility_data = results.rows;
          var mongo_query = { zip: facility_data[0].zip_code.toString() };
          await db.collection('WelfareInfo').find(mongo_query).toArray()
            .then(results => {
              mongo_data = results
            })
            .catch(error => console.error(error))
        })
    })

  res.render('details.ejs', {
    fac_name: facility_data !== undefined ? facility_data[0].facility_name : [],
    capacity_data: capacity_data[0],
    mongo_data: mongo_data
  });

})

app.listen(3000, function () {
  console.log('listening on 3000')
})
