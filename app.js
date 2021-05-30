const express = require('express');
var session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

app.use(
  session({
    secret: 'any secret text',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 600000 },
  })
);

app.use(express.static('public'));
app.use(function (req, res, next) {
  res.set(
    'Cache-Control',
    'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'
  );
  next();
});

// ---------------------------------------------CONNECT TO DB---------------------------------------------------------
//connect to your mysql server
let connection = mysql.createConnection({
  host: 'your host',
  user: 'your username',
  password: 'your password',
  database: 'database name',
  multipleStatements: true,
});
connection.connect(function (err) {
  if (err) {
    return console.error('error: ' + err.message);
  } else {
    console.log('Connected to the MySQL server.');
  }
});

// ---------------------------------------------CONNECT TO DB---------------------------------------------------------

// ---------------------------------------------REGISTRATION AND LOGIN---------------------------------------------------------

app.get('/', function (req, res, next) {
  res.render('registration-form');
});
// to store user input detail on post request
app.post('/', function (req, res, next) {
  inputData = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email_address: req.body.email_address,
    password: req.body.password,
    confirm_password: req.body.confirm_password,
  };
  // check unique email address
  var sql = 'SELECT * FROM registration WHERE email_address =?;';
  connection.query(
    sql,
    [inputData.email_address],
    function (err, data, fields) {
      if (err) throw err;
      if (data.length >= 1) {
        var msg =
          'account for the email: ' +
          inputData.email_address +
          ' already exists';
      } else if (inputData.confirm_password != inputData.password) {
        var msg = 'Password & Confirm Password is not Matched';
      } else {
        // save users data into database
        var sql = 'INSERT INTO registration SET ?';
        connection.query(sql, inputData, function (err, data) {
          if (err) throw err;
        });
        var msg = 'You are successfully registered';
      }
      res.render('registration-form', { alertMsg: msg });
    }
  );
});

app.get('/', function (req, res, next) {
  if (req.session.emailAddress != null) {
    res.redirect('/homepage');
  } else {
    res.render('login-form');
  }
});
app.post('/', function (req, res) {
  var emailAddress = req.body.email_address;
  var password = req.body.password;
  var sql = 'SELECT * FROM registration WHERE email_address =? AND password =?';
  connection.query(sql, [emailAddress, password], function (err, data, fields) {
    if (err) throw err;
    if (data.length > 0) {
      req.session.loggedinUser = true;
      req.session.emailAddress = emailAddress;
      res.redirect('/homepage');
    } else {
      res.render('login-form', { alertMsg: 'Wrong or empty input' });
    }
  });
});

app.get('/logout', function (req, res) {
  req.session.destroy();
  res.render('login-form', { alertMsg: 'Successfully Logged out' });
});

// ---------------------------------------------REGISTRATION AND LOGIN---------------------------------------------------------

// ---------------------------------------------HOMEPAGE---------------------------------------------------------

app.get('/homepage', function (req, res) {
  if (req.session.emailAddress != null) {
    res.sendFile(__dirname + '/Basic/Home.html');
  } else {
    res.render('login-form', {
      alertMsg: 'You must login to access the website.',
    });
  }
});

app.post('/homepage', function (req, res) {
  var buttonSwitch = req.body.homebutton;
  switch (buttonSwitch) {
    case '1':
      res.redirect('/insert');
      break;
    case '2':
      res.redirect('/delete');
      break;
    case '3':
      res.redirect('/updateButtons');
      break;
    case '4':
      res.redirect('/view');
      break;
    default:
      console.log(buttonSwitch);
  }
});

// ---------------------------------------------HOMEPAGE---------------------------------------------------------

// ---------------------------------------------INSERTION---------------------------------------------------------

app.get('/insert', function (req, res) {
  if (req.session.emailAddress != null) {
    res.sendFile(__dirname + '/Basic/Form.html');
  } else {
    res.render('login-form', {
      alertMsg: 'You must login to access the website.',
    });
  }
});

app.post('/insert', function (req, res, next) {
  // 1st table
  var pid = req.body.pid;
  var name = req.body.name;
  var email = req.body.email;
  var phone = req.body.phone;
  var gender = req.body.gender;
  // 2nd table
  var age = req.body.age;
  var weight = req.body.weight;
  var bloodgroup = req.body.bloodgroup;
  var bloodsugar = req.body.bloodsugar;
  var bp = req.body.bp;
  // 3rd table
  var date = req.body.date;
  var aid = req.body.aid;
  var symp = req.body.symp;
  var pres = req.body.pres;
  var dose = req.body.dose;
  // 4th Table
  var amount = req.body.amount;
  var box = req.body.radio1;
  var paidon = req.body.paidon;
  // 5th Table
  var dept = req.body.dept;
  var doc = req.body.doc;
  var sql = `INSERT INTO personal (PID, Name, Gender, Email, Phone) VALUES ('${pid}', '${name}', '${gender}', '${email}', '${phone}');`;
  sql += `INSERT INTO medical (PID, Age, Weight, Bloodgroup, BloodSugar, Bloodpressure) VALUES ('${pid}', '${age}', '${weight}', '${bloodgroup}', '${bloodsugar}', '${bp}');`;
  sql += `INSERT INTO prescription (AID, PID, Date, Symptoms, Prescription, Dose) VALUES ('${aid}', '${pid}', '${date}', '${symp}', '${pres}', '${dose}');`;
  sql += `INSERT INTO fees (PID, AID, Amount, Paid, PaidOn) VALUES ('${pid}', '${aid}', '${amount}', '${box}', '${paidon}');`;
  sql += `INSERT INTO others (PID, Department, Doctor) VALUES ('${pid}', '${dept}', '${doc}');`;
  connection.query(sql, function (err, data) {
    if (err) {
      res.sendFile(__dirname + '/Basic/Fail.html');
    } else {
      res.redirect('/success');
    }
  });
});

// ---------------------------------------------INSERTION---------------------------------------------------------

// ---------------------------------------------DELETION---------------------------------------------------------

app.get('/delete', function (req, res) {
  if (req.session.emailAddress != null) {
    res.sendFile(__dirname + '/Basic/Delete.html');
  } else {
    res.render('login-form', {
      alertMsg: 'You must login to access the website.',
    });
  }
});

app.post('/delete', function (req, res) {
  var pid = req.body.pid;
  var sql = `DELETE FROM personal WHERE PID = ?;`;
  connection.query(sql, [pid], function (err, data) {
    if (err || data.affectedRows === 0) {
      res.sendFile(__dirname + '/Basic/Fail.html');
    } else {
      res.redirect('/success');
    }
  });
});

// ---------------------------------------------DELETION---------------------------------------------------------

// ---------------------------------------------UPDATION---------------------------------------------------------

app.get('/updateButtons', function (req, res) {
  if (req.session.emailAddress != null) {
    res.sendFile(__dirname + '/Basic/Update.html');
  } else {
    res.render('login-form', {
      alertMsg: 'You must login to access the website.',
    });
  }
});

app.post('/updateButtons', function (req, res) {
  var buttonSwitch = req.body.updatebutton;
  switch (buttonSwitch) {
    case '1':
      res.redirect('/updateTable1');
      break;
    case '2':
      res.redirect('/updateTable2');
      break;
    case '3':
      res.redirect('/updateTable3');
      break;
    case '4':
      res.redirect('/updateTable4');
      break;
    case '5':
      res.redirect('/updateTable5');
      break;
    default:
      console.log(buttonSwitch);
  }
});

app.get('/updateTable1', function (req, res) {
  if (req.session.emailAddress != null) {
    res.sendFile(__dirname + '/Update/Personal.html');
  } else {
    res.render('login-form', {
      alertMsg: 'You must login to access the website.',
    });
  }
});

app.post('/updateTable1', function (req, res) {
  var pidupdate = req.body.pidupdate;
  var pid = req.body.pid;
  var name = req.body.name;
  var email = req.body.email;
  var phone = req.body.phone;
  var gender = req.body.gender;
  var sql = `UPDATE personal SET PID = ?, Name = ?, Email = ?, Phone = ?, Gender = ? WHERE PID = ?;`;
  connection.query(
    sql,
    [pid, name, email, phone, gender, pidupdate],
    function (err, data) {
      console.log(data);
      if (err || data.changedRows === 0) {
        res.sendFile(__dirname + '/Basic/Fail.html');
      } else {
        res.redirect('/success');
      }
    }
  );
});

app.get('/updateTable2', function (req, res) {
  if (req.session.emailAddress != null) {
    res.sendFile(__dirname + '/Update/medical.html');
  } else {
    res.render('login-form', {
      alertMsg: 'You must login to access the website.',
    });
  }
});

app.post('/updateTable2', function (req, res) {
  var pid = req.body.pid;
  var age = req.body.age;
  var weight = req.body.weight;
  var bloodgroup = req.body.bloodgroup;
  var bloodsugar = req.body.bloodsugar;
  var bp = req.body.bp;

  var sql = `UPDATE medical SET PID = ?, Age= ?, Weight = ?, Bloodgroup = ?, Bloodsugar = ?, Bloodpressure = ?`;
  connection.query(
    sql,
    [pid, age, weight, bloodgroup, bloodsugar, bp],
    function (err, data) {
      if (err || data.length === 0) {
        res.sendFile(__dirname + '/Basic/Fail.html');
      } else {
        res.redirect('/success');
      }
    }
  );
});

app.get('/updateTable3', function (req, res) {
  if (req.session.emailAddress != null) {
    res.sendFile(__dirname + '/Update/symptom.html');
  } else {
    res.render('login-form', {
      alertMsg: 'You must login to access the website.',
    });
  }
});

app.post('/updateTable3', function (req, res) {
  var aidupdate = req.body.aidupdate;
  var pidupdate = req.body.pidupdate;
  // var pid = req.body.pid;
  var aid = req.body.aid;
  var date = req.body.date;
  var symp = req.body.symp;
  var pres = req.body.pres;
  var dose = req.body.dose;
  var sql = `UPDATE prescription SET AID = ?, Date = ?, Symptoms = ?, Prescription = ?, Dose = ? WHERE AID = ? AND PID = ?;`;
  connection.query(
    sql,
    [aid, date, symp, pres, dose, aidupdate, pidupdate],
    function (err, data) {
      if (err || data.length === 0) {
        res.sendFile(__dirname + '/Basic/Fail.html');
      } else {
        res.redirect('/success');
      }
    }
  );
});

app.get('/updateTable4', function (req, res) {
  if (req.session.emailAddress != null) {
    res.sendFile(__dirname + '/Update/fee.html');
  } else {
    res.render('login-form', {
      alertMsg: 'You must login to access the website.',
    });
  }
});

app.post('/updateTable4', function (req, res) {
  var pid = req.body.pid;
  var aid = req.body.aid;
  var amount = req.body.amount;
  var box = req.body.radio1;
  var paidon = req.body.paidon;
  var sql = `UPDATE fees SET AID = ?, PID = ?, Amount = ?, Paid = ?, PaidOn = ?;`;
  connection.query(sql, [aid, pid, amount, box, paidon], function (err, data) {
    if (err || data.length === 0) {
      res.sendFile(__dirname + '/Basic/Fail.html');
    } else {
      res.redirect('/success');
    }
  });
});

app.get('/updateTable5', function (req, res) {
  if (req.session.emailAddress != null) {
    res.sendFile(__dirname + '/Update/other.html');
  } else {
    res.render('login-form', {
      alertMsg: 'You must login to access the website.',
    });
  }
});

app.post('/updateTable5', function (req, res) {
  var pid = req.body.pid;
  var dept = req.body.dept;
  var doc = req.body.doc;
  var sql = `UPDATE others SET PID = ?, Department = ?, Doctor = ?;`;
  connection.query(sql, [pid, dept, doc], function (err, data) {
    if (err || data.length === 0) {
      res.sendFile(__dirname + '/Basic/Fail.html');
    } else {
      res.redirect('/success');
    }
  });
});

// ---------------------------------------------UPDATION---------------------------------------------------------

// ---------------------------------------------VIEW---------------------------------------------------------

app.get('/view', function (req, res) {
  if (req.session.emailAddress != null) {
    res.sendFile(__dirname + '/Basic/staffdisplay.html');
  } else {
    res.render('login-form', {
      alertMsg: 'You must login to access the website.',
    });
  }
});
app.post('/view', function (req, res) {
  var email = req.body.email;
  var sqlInner = `INNER JOIN medical ON personal.PID = medical.PID INNER JOIN prescription ON personal.PID = prescription.PID INNER JOIN fees ON personal.PID = fees.PID INNER JOIN others ON personal.PID = others.PID`;
  var sql = `SELECT * FROM personal ` + sqlInner + ` WHERE Email = ?`;
  connection.query(sql, [email], function (err, data) {
    if (err || data.length === 0) {
      res.sendFile(__dirname + '/Basic/Fail.html');
    } else {
      res.render('view', { title: 'Patient Data', userData: data });
    }
  });
});
// ---------------------------------------------VIEW---------------------------------------------------------

// ---------------------------------------------SUCCESS AND FAILURE---------------------------------------------------------

app.get('/success', function (req, res) {
  res.sendFile(__dirname + '/Basic/Success.html');
});

app.post('/success', function (req, res) {
  res.redirect('/homepage');
});

app.get('/failure', function (req, res) {
  res.sendFile(__dirname + '/Basic/Fail.html');
});

app.post('/failure', function (req, res) {
  res.redirect('/homepage');
});

app.get('/gotohome', function (req, res) {
  res.sendFile(__dirname + '/Basic/Home.html');
});
app.post('/gotohome', function (req, res) {
  res.redirect('/homepage');
});

// ---------------------------------------------SUCCESS AND FAILURE---------------------------------------------------------

// ---------------------------------------------LISTEN TO SERVER---------------------------------------------------------

app.listen(process.env.PORT || 3000, function () {
  console.log('server listening at port 3000');
});

// ---------------------------------------------LISTEN TO SERVER---------------------------------------------------------
