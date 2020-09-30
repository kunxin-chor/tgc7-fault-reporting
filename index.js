const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
const MongoUtil = require("./MongoUtil");
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

const app = express();

require("dotenv").config();

// setup the view engine
app.set("view engine", "hbs");

// setup wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

// setup the static folder
app.use(express.static("public"));

// setup forms
app.use(
  express.urlencoded({
    extended: false,
  })
);

// setup session
app.use(cookieParser("909rtfsalfj04-9fjsl03"));
app.use(session({
    'cookie': {
        'maxAge': 60000
    }
}))

// setup flash message. We must set up session first beforehand
app.use(flash());

// middleware to expose flashed messages to all the views
app.use(function(req, res, next){
    res.locals.success_messages = req.flash('success_messages');
    res.locals.error_messages = req.flash('error_messages');
    next();
})

// form constants
const tags = [
  {
    key: "equipment-fault",
    label: "Equipment fault",
  },
  {
    key: "maintainence",
    label: "Maintainece related",
  },
  {
    key: "infrastructure",
    label: "Infrastructure-related",
  },
];

const blockNumbers = [
  {
    key: "304",
    label: "Blk 304",
  },
  {
    key: "305",
    label: "Blk 305",
  },
  {
    key: "306",
    label: "Blk 306",
  },
];

async function main() {
  
    await MongoUtil.connect(process.env.MONGO_URL, 'faults');

  // ROUTES BEGIN HERE
  app.get("/", (req, res) => {
    res.render("index");
  });

  app.get('/faults', async (req,res)=>{
      let db = MongoUtil.getDB();
      let allFaults = await db.collection('reports').find().toArray();
      res.render('faults', {
          allFaults
      })
  })

  app.get("/faults/add", (req, res) => {
    res.render("add_fault", {
      tags: tags,
      blockNumbers,
    });
  });

  app.post("/faults/add", async (req, res) => {
    let { title, location, tags, block } = req.body;
    /*
        let title = req.body.title;
        let location= req.body.location
    */
   
    if (! Array.isArray(tags)) {
       tags = [tags];
    }
    /*
        tags = isArray(tags): tags ? [tags];
        tags = [].concat(tags);
    */

    let db = MongoUtil.getDB();
    await db.collection('reports').insertOne({
        title, location, tags, block
    })
    req.flash('success_messages', "New fault has been added successfully!");
    res.redirect('/faults')
  });

  // ROUTES END HERE

  // run the server
  app.listen(3000, () => {
    console.log("server started");
  });
}

// initate setup of Mongo and Express
main();