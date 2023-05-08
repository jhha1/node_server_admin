const express = require('express');
const path = require('path');
const glob = require('glob');
const bodyParser = require('body-parser');
const initializer = require('./src/common/initialize');

const app = express();
const SERVER_PORT = 8889;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
    global.site_path = req.path;
    next();
});

const routes = glob.sync(`${__dirname}/src/routes/*.js`);
for (const route of routes) {
    require(route)(app);
}

initializer.initializeAppServer(app);

app.listen(SERVER_PORT, () => {
    console.log(`Server running on port: ${SERVER_PORT}`);
});
