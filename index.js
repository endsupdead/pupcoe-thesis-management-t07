const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const session = require('express-session');
const bodyParser = require('body-parser')
const flash = require('express-flash-messages');
const expressValidator = require('express-validator');

const db = require('./db/db.js')
const admin = require('./models/admin.js')
const adviser = require('./models/adviser.js')
const student = require('./models/student.js')

const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const app = express();
// tell express which folder is a static/public folder
app.set('views', path.join(__dirname,'views'));
app.engine('handlebars', exphbs({
	defaultLayout:'main',
	layoutsDir: __dirname + '/views/layouts/',
  partialsDir: __dirname + '/views/partials/'
}));
app.set('view engine','handlebars');
app.set('port',(process.env.PORT|| 3000));
app.use(express.static(path.join(__dirname, 'public')));

//body-parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
app.use(express.json());

//session
app.use(session({
  secret: 'cpethesismanagement',
  resave: false,
  saveUninitialized: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(expressValidator());

passport.use(new Strategy({
  usernameField: 'email',
  passwordField: 'password'
},
  function(email, password, cb) {
    admin.getByEmail(email, function(user) {
      if (!user) { return cb(null, false); }
      bcrypt.compare(password, user.password).then(function(res) {
      if (res == false) { return cb(null, false); }
      return cb(null, user);
      });

   });
}));

passport.serializeUser(function(user, cb){
  cb(null, user.id);


});

passport.deserializeUser(function(id, cb) {
  admin.getById(id, function (user) {
    cb(null, user);
  });
});
function isAdmin(req, res, next) {
   if (req.isAuthenticated()) {
      console.log(req.user);
  admin.getById(req.user.id,function(user){
    role = user.user_type;
    console.log('role:',role);
    if (role == 'admin') {
        return next();
    }
    else{
      res.send('cannot access!');
    }
  });
  }
  else{
res.redirect('/login');
	}
}
function isFaculty(req, res, next) {
   if (req.isAuthenticated()) {
  admin.getById(req.user.id,function(user){
    role = 
    console.log('role:',role);
    if (role == 'faculty') {
        return next();
    }
    else{
      res.send('cannot access!');
    }
  });
  }
  else{
res.redirect('/login');
}
}


function isStudent(req, res, next) {
   if (req.isAuthenticated()) {
  admin.getGroupId(req.user.id,function(user){
    req.session.group_id = user.group_id;
    console.log(req.session.group_id)
    role = req.user.user_type;
    if (role == 'student') {
        return next();
    }
    else{
      res.send('cannot access!');
    }
  });
  }
  else{
res.redirect('/login');
}
}
function isGuest(req, res, next) {
   if (req.isAuthenticated()) {
  admin.getById(req.user.id,function(user){
    role = user.user_type;
    console.log('role:',role);
    if (role == 'guest') {
        return next();
    }
    else{
      res.send('cannot access!');
    }
  });
  }
  else{
res.redirect('/login');
}
}
//RAAAALLLLPPPHHHHHHHHHHHHHHH!


//--------------------------------------------------
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/', function (req, res) {
  res.render('home', {
  });
});

app.get('/home', function(req, res) {
	res.render('home',{
	});
});

app.get('/forgot_password', function(req, res) {
	res.render('forgot_password',{
		
	});
});

app.get('/compendium', function(req, res) {
	res.render('compendium',{
		
	});
});
//--------------------------------------------------

//ADMIN---------------------------------------------
app.get('/login', function(req, res) {
  const flashMessages = res.locals.getMessages();
  console.log('flash', flashMessages);
	res.render('cpe_admin/admin_login',{
		
	});
});

app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login',failureFlash: true}),
  function(req, res) {
          console.log(req.user.user_type);
    role = req.user.user_type;
    if (role == 'admin') {

        res.redirect('/admin/dashboard')
    }
    else if (role == 'student'){
        res.redirect('/students/home')
    }
    else if (role == 'faculty'){
        res.redirect('/faculty/dashboard')
    }
  });

app.get('/admin/dashboard',isAdmin, function(req, res) {
	res.render('cpe_admin/admin_dashboard',{
		
	});
});

app.get('/admin/registration', function(req, res) {

  admin.sectionList({},function(classList){
  	admin.facultyList({},function(facultyList){
  			res.render('cpe_admin/admin_registration',{
  				class: classList,
          faculty: facultyList
    	    });
    	 });
    });
});

app.post('/admin/registration/user', function (req, res) {
		bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(req.body.password, salt, function(err, hash) {
         admin.createUser(
		  {
		    firstName: req.body.fname,
		    middleName: req.body.mname,
		    lastName: req.body.lname, 
		    contactNo: req.body.contacts,
		    email: req.body.email,
		    userType: req.body.usertype,
		    password: hash
		  },
		  function(id){
		  	console.log(id[0].id)
		 	if (req.body.usertype == "student"){
         admin.insertStudent(
		  {
		    userid: id[0].id,
		    classid: req.body.class
		  },
		  function(callback){;
		 	  });
	}
		    res.redirect('/admin/registration');
		 	  });
	   });
	});
});

app.post('/admin/registration/class', function (req, res) {

  admin.createClass(
      {
        section: req.body.class_no,
        adviserid: req.body.adviser,
        acadyear: req.body.acad_year,

      },
      function(callback){
        res.redirect('/admin/registration');
        });
     });


app.get('/admin/students', function(req, res) {
	res.render('cpe_admin/admin_students',{
		
	});
});

app.get('/admin/faculty', function(req, res) {
	res.render('cpe_admin/admin_faculty',{
		
	});
});

app.get('/admin/guest_panel', function(req, res) {
	res.render('cpe_admin/admin_guest_panel',{
		
	});
});

app.get('/admin/schedule', function(req, res) {
	res.render('cpe_admin/admin_schedule',{
		
	});
});

app.get('/admin/settings', function(req, res) {
	res.render('cpe_admin/admin_account_settings',{
		
	});
});
//ADMIN---------------------------------------------

//FACULTY---------------------------------------------
app.get('/faculty/dashboard', function(req, res) {
	res.render('cpe_faculty/faculty_dashboard',{
		
	});
});

app.get('/faculty/proposals', function(req, res) {
        res.render('cpe_faculty/faculty_proposals',{
    });
});

app.get('/faculty/mor', function(req, res) {
	res.render('cpe_faculty/faculty_mor',{
		
	});
});

app.get('/faculty/dp1', function(req, res) {
	res.render('cpe_faculty/faculty_dp_1',{
		
	});
});

app.get('/faculty/dp2', function(req, res) {
	res.render('cpe_faculty/faculty_dp_2',{
		
	});
});

app.get('/faculty/schedule', function(req, res) {
	res.render('cpe_faculty/faculty_schedule',{
		
	});
});

app.get('/faculty/settings', function(req, res) {
	res.render('cpe_faculty/faculty_account_settings',{
		
	});
});
//FACULTY---------------------------------------------

//ADVISER---------------------------------------------
app.get('/adviser/dashboard', function(req, res) {
  res.render('cpe_adviser/adviser_dashboard',{

  });
});

app.get('/adviser/proposals', function(req, res) {
  adviser.listThesis({adviserid:req.user.id,currentstage: 1},function(result){
        res.render('cpe_adviser/adviser_proposals',{
          proposal: result.rows
    });
  }); 
});

app.get('/adviser/mor', function(req, res) {
  var class_id;
  var group_list;
  adviser.classId({id:req.user.id},function(result){
      class_id = result[0].id;

  });
  adviser.classList({id:req.user.id},function(classList){
     adviser.groupList({id:class_id},function(result){
    res.render('cpe_adviser/adviser_mor',{
    classList:classList,
    classid:class_id,
    groupList: result
  });

   });

  });
});

app.post('/adviser/mor', function (req, res) {
  var studentid = req.body.studentid;
  var groupData  = "";


    adviser.createGroup(
      {
        groupName: req.body.groupName,
        classid: req.body.classid
      },
      function(id){  
      for (var i = 0; i < studentid.length;i++){
      groupData = groupData + "('"+id[0].id+"','"+studentid[i]+"')"+",";
     }
     groupData = groupData.slice(0,-1);
     console.log(groupData);
      adviser.insertMembers(groupData ,
      function(callback){
       });

       res.redirect('/adviser/mor');
       });

});

app.get('/adviser/dp1', function(req, res) {
  res.render('cpe_adviser/adviser_dp_1',{

  });
});

app.get('/adviser/dp2', function(req, res) {
  res.render('cpe_adviser/adviser_dp_2',{

  });
});

app.get('/adviser/schedule', function(req, res) {
  res.render('cpe_adviser/adviser_schedule',{

  });
});

app.get('/adviser/settings', function(req, res) {
  res.render('cpe_adviser/adviser_account_settings',{

  });
});
//ADVISER---------------------------------------------

//GUEST PANEL---------------------------------------------
app.get('/guest_panel/home', function(req, res) {
	res.render('cpe_guest_panel/guest_panel_home',{
		
	});
});

app.get('/guest_panel/mor', function(req, res) {
	res.render('cpe_guest_panel/guest_panel_mor',{
		
	});
});

app.get('/guest_panel/dp1', function(req, res) {
	res.render('cpe_guest_panel/guest_panel_dp_1',{
		
	});
});

app.get('/guest_panel/dp2', function(req, res) {
	res.render('cpe_guest_panel/guest_panel_dp_2',{
		
	});
});

app.get('/guest_panel/schedule', function(req, res) {
	res.render('cpe_guest_panel/guest_panel_schedule',{
		
	});
});

app.get('/guest_panel/settings', function(req, res) {
	res.render('cpe_guest_panel/guest_panel_account_settings',{
		
	});
});
//GUEST PANEL---------------------------------------------

//STUDENT---------------------------------------------
app.get('/students/home', isStudent, function(req, res) {
	res.render('cpe_students/students_home',{
		
	});
});

app.get('/students/mor', function(req, res) {
	res.render('cpe_students/students_mor',{
		
	});  
});

app.post('/students/mor/add', function (req, res) {
 console.log('aa')
    student.addProposal(
      {
        title: req.body.proposal_title,
        abstract: req.body.proposal_abstract,
        groupid: req.session.group_id
      },
      function(callback){  
        console.log(callback)
       res.redirect('/students/mor');
       });

});

app.get('/students/dp1', function(req, res) {
	res.render('cpe_students/students_dp_1',{
		
	});
});

app.get('/students/dp2', function(req, res) {
	res.render('cpe_students/students_dp_2',{
		
	});
});

app.get('/students/schedule', function(req, res) {
	res.render('cpe_students/students_schedule',{
		
	});
});

app.get('/students/adviser', function(req, res) {
	res.render('cpe_students/students_adviser',{
		
	});
});

app.get('/students/settings', function(req, res) {
	res.render('cpe_students/students_account_settings',{
		
	});
});
//STUDENT---------------------------------------------

app.listen(app.get('port'), function() {
	console.log('Server started at port 3000');
});
