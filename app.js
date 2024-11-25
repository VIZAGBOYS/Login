const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

// Dynamically import `open` package for ES module compatibility
(async () => {
  const open = (await import('open')).default; // Dynamic import with the default export

  const app = express();
  const users = []; // Sample in-memory users database
  let loggedInUser = null;

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
  }));

  // Home route
  app.get('/', (req, res) => {
    res.render('index');
  });

  // Signup route
  app.get('/signup', (req, res) => {
    res.render('signup');
  });

  app.post('/signup', (req, res) => {
    const { name, email, phone, password, age, gender } = req.body;
    users.push({ name, email, phone, password, age, gender });
    res.redirect('/login');
  });

  // Login route
  app.get('/login', (req, res) => {
    res.render('login', { errorMessage: '' });
  });

  app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      req.session.user = user;
      loggedInUser = user;
      res.redirect('/home');
    } else {
      res.render('login', { errorMessage: 'Invalid credentials. Please try again.' });
    }
  });

  // Home route
  app.get('/home', (req, res) => {
    if (!loggedInUser) {
      return res.redirect('/login');
    }
    res.render('home');
  });

  // Logout route
  app.get('/logout', (req, res) => {
    req.session.destroy();
    loggedInUser = null;
    res.redirect('/login');
  });

  // Set the view engine
  app.set('views', path.join(__dirname, 'views')); // Ensure the path to views is set
  app.set('view engine', 'ejs');

  // Start the server and open the browser automatically
  app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
    open('http://localhost:3000');
  });
})();
