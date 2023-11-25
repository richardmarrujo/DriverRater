import express from "express";
import bodyParser from "body-parser";
import sql from "msnodesqlv8";
import session from "express-session";
import bcrypt from "bcrypt";
import { customLog } from './serverLogger.js';



const app = express();
//const upload = multer({ dest: "uploads/" }); // Set the destination folder for uploaded files

// Set up the body-parser middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = 3000;

// Create a configuration object for the database connection
const connectionString = "server=localhost;database=Road Rater;Trusted_Connection=Yes;Driver={SQL Server Native Client 11.0}";


app.use(express.static("public"));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));

// Middleware function to check authentication
const isAuthenticated = (req, res, next) => {
    // Check if user is authenticated, redirect to login if not
    if (req.session.isAuthenticated) {
        return next();
    }
    res.redirect('/login');
};

// Middleware function to check for admin privileges
const isAdmin = (req, res, next) => {
    if (req.session.isAuthenticated && req.session.isAdmin) {
        return next();
    }
    res.status(403).send('Access denied');
};

app.get('/login', (req, res) => {
    res.render("login.ejs");
});

app.get('/register', (req, res) => {
    res.render("register.ejs"); // Render the registration form
});

app.post('/register', async (req, res) => {
  console.log("New registration")
  customLog("New registration")
  
    try {
        const { username, password } = req.body;

        // Hash and salt the user's password before storing it
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the number of rounds for hashing

        // Save the user to the database with the hashed password
        const insertQuery = `
            INSERT INTO dbo.userlist (username, hashedPassword)
            VALUES (?, ?)
        `;

        console.log("Username and Password:", username, password)
        customLog(`Username and Password: ${username} ${password}`);

        // Execute the SQL insertion query
        sql.query(connectionString, insertQuery, [username, hashedPassword], (err) => {
            if (err) {
                console.error('Error during user registration:', err);
                customLog('Error during user registration:', err);
                res.status(500).send('Internal Server Error');
            } else {
                // Redirect to the login page after successful registration
                res.redirect('/login');
            }
        });
    } catch (error) {
        console.error('Error during registration:', error);
        customLog('Error during registration:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/', isAuthenticated, (req, res) => {
    res.render("index.ejs");
});

app.get('/search', (req, res) => {
  const username = req.session.username;
  try {
    // Get the search term from the query parameters
    const searchTerm = req.query.search;
    
    // Construct the SQL query with the search term
    const query = `
      SELECT Top 3 *
      FROM dbo.submissions
      WHERE UserName LIKE ? OR plateValue LIKE ? OR dateValue LIKE ? OR rateValue LIKE ? OR commentsValue LIKE ? order by dateValue desc
    `;

    // Create an array of parameters corresponding to the placeholders
        const searchPattern = `%${searchTerm}%`.toString().replace("/","-");
        const params = [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern];

        // Perform the database search using parameterized query
        sql.query(connectionString, query, params, (err, rows) => {
          if (err) {
            console.error('Error executing the query:', err);
            customLog('Error executing the query:', err);
            res.status(500).send('Internal Server Error');
          } else {
            // Format the dateValue to only display the date part without the time
            const formattedResults = rows.map(row => {
                const originalDate = new Date(row.dateValue);
                originalDate.setDate(originalDate.getDate() + 1); // Adjust the date by adding 1 day
                const adjustedDate = new Date(originalDate); // Create a new date object and make it a string so replace works

                return {
                  UserName: row.UserName,
                  dateValue: adjustedDate,
                  rateValue: row.rateValue,
                  plateValue: row.plateValue,
                  commentsValue: row.commentsValue
                };
        });

        // Send the search results as JSON response
        res.json(formattedResults);
        console.log("User:" , username, "searched for", searchPattern, formattedResults)
        customLog(`User: ${username}, searched for ${searchPattern}`)
      }
    });
  } catch (err) {
    console.error('Error performing the search:', err);
    customLog('Error performing the search:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/submit', (req, res) => {

  // Create a configuration object for the database connection
  const connectionString = "server=localhost;database=Road Rater;Trusted_Connection=Yes;Driver={SQL Server Native Client 11.0}";

  const username = req.session.username;
  
  try {
    // Get the form field values
    const dateValue = req.body.dateValue;
    const rateValue = req.body.rateValue;
    const plateValue = req.body.plateValue;
    const commentsValue = req.body.commentsValue;

    const rateValueNumber = parseInt(rateValue, 10);

    console.log( "Submitting {", dateValue, "," , rateValueNumber, "," , plateValue, "," , commentsValue, "}");
    customLog(`Submitting Date {${dateValue}}, RateValueNumber {${rateValueNumber}}, Plate {${plateValue}}, Comments {${commentsValue}}`);

    // Get the latest NRID from the database
    const latestNRIDQuery = `
      SELECT TOP 1 NRID
      FROM dbo.submissions
      ORDER BY NRID DESC
    `;

    sql.query(connectionString, latestNRIDQuery, (err, rows) => {
      if (err) {
        console.error('Error retrieving latest NRID:', err);
        customLog('Error retrieving latest NRID:', err);
        res.status(500).send('Internal Server Error');
        return;
      }

      let latestNRID = 1; // Default value if no previous submissions
      if (rows.length > 0) {
        latestNRID = rows[0].NRID + 1; // Increment the latest NRID
      }

      // Construct the SQL query for insertion with the latest NRID
      const insertQuery = `
        INSERT INTO dbo.submissions (NRID, dateValue, UserName, rateValue, plateValue, commentsValue)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      // Perform the database insertion
      sql.query(connectionString, insertQuery, [latestNRID, dateValue, username, rateValueNumber, plateValue, commentsValue], (err) => {
        if (err) {
          console.error('Error inserting submission:', err);
          customLog('Error inserting submission:', err);
          res.status(500).send('Internal Server Error');
        } else {
          console.log("User:", username, "successfully submitted {", dateValue, "," , rateValueNumber, "," , plateValue, "," , commentsValue, "}");
          customLog(`User: ${username} successfully submitted Date {${dateValue}}, Rate {${rateValueNumber}}, Plate {${plateValue}}, Comments {${commentsValue}}`);

          // Send a successful response
          res.status(200).json({ message: "Form data submitted successfully" });
        }
      });
    });
  } catch (err) {
    console.error('Error submitting form:', err);
    customLog('Error submitting form:', err);
    res.status(500).send('Internal Server Error');
  }
});


app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Query your SQL database for user data based on the provided username
        const query = `
            SELECT username, hashedPassword
            FROM dbo.userlist
            WHERE username = ?
        `;

        console.log("Username and Password:", username, password)
        customLog("Username and Password:", username, password)

        sql.query(connectionString, query, [username], async (err, rows) => {
            if (err) {
                console.error('Error querying the database:', err);
                CustomLog('Error querying the database:', err);
                return res.status(500).send('Internal Server Error');
            }

            if (rows.length === 0) {
                return res.status(401).json({ message: 'Invalid username or password' });
            }

            const user = rows[0];
            const hashedPassword = user.hashedPassword;

            // Compare hashed password from the database with the provided password
            const passwordMatch = await bcrypt.compare(password, hashedPassword);

            if (!passwordMatch) {
                return res.status(401).json({ message: 'Invalid username or password' });
            }

            if (!req.session) {
              console.error('Session object is undefined');
              customLog('Session object is undefined');
              return res.status(500).send('Internal Server Error');
            }

            // Set isAuthenticated session flag and username
            req.session.isAuthenticated = true;
            req.session.username = username;

            // Redirect to the main page after successful login
            res.redirect('/');
        });
    } catch (error) {
        console.error('Error during login:', error);
        customLog('Error during login:', error);
        res.status(500).send('Internal Server Error');
    }
});



app.listen(port, () => {
  console.log(`Listening on port ${port}`);
  customLog(`Listening on port ${port}`);
});
