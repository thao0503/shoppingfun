const express = require("express");
const path = require('path');
const methodOverride = require("method-override");
const bodyParser= require("body-parser");
require('dotenv').config();
const database = require("./config/database");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require('express-flash');
const moment = require('moment');

const routeAdmin = require("./routes/admin/index.route");
const route = require("./routes/client/index.route");

const systemConfig = require("./config/system");

database.connect();

const app = express();
const port = process.env.PORT;

app.use(methodOverride(`_method`));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))


app.set("views", `${__dirname}/views`);
app.set("view engine", "pug");

// Flash
app.use(cookieParser('DJKFJDKFIRHDD'));
app.use(session({ cookie: { maxAge: 60000 }}));
app.use(flash());
// End Flash

// tinymce
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));
// end tinymce

// App locals variables
app.locals.prefixAdmin = systemConfig.prefixAdmin;
app.locals.moment = moment;
app.use(express.static(`${__dirname}/public`));

//Routes
routeAdmin(app);
route(app);

app.listen(port,()=>{
    console.log(`App listening on port ${port}`);
});