const AttendeesCRUD = require("./src/services/AttendeesCRUD");
const express = require("express");
const listEndpoints = require("express-list-endpoints");
const path = require("path");
const hbs = require("hbs");
require('dotenv').config();

const usersRouter = require("./src/services/users");
const filesRouter = require("./src/services/files");
const problematicRoutesRouter = require("./src/services/problematicRoutes");
const attendeesRouter = new AttendeesCRUD('attendees.json');
//const moviesRouter = require("./src/services/movies");

const LoggerMiddleware = (req, res, next) => {
  console.log(`${req.url} ${req.method} -- ${new Date()}`);
  next();
};

const requireJSONContentOnlyMiddleware = () => {
  return (req, res, next) => {
    if (req.headers["content-type"] !== "application/json") {
      res
        .status(400)
        .send("Server requires application/json only as content type");
    } else {
      next();
    }
  };
};

const server = express(); // Create http server with express

server.set("view engine", "hbs");

server.set("views", path.join(__dirname, "./views"));

hbs.registerPartials(path.join(__dirname, "./views/partials"));

const port = process.env.PORT;

// console.log(process.env);

//server.use(requireJSONContentOnlyMiddleware());
server.use(LoggerMiddleware);
server.use(express.json()); // To parse request bodies into objects
server.use(express.static("public"));
server.use("/users", usersRouter); // Each request on http://localhost:3000/users is handled by usersRouter
//server.use("/movies", moviesRouter); // Each request on http://localhost:3000/movies is handled by moviesRouter
server.use("/files", filesRouter); // Each request on http://localhost:3000/files is handled by filesRouter
server.use("/problematicRoutes", problematicRoutesRouter);
server.use("/attendees", attendeesRouter.generateRoutes());

// server.get("/", (req, res) => {
//   res.render("index", { title: "HOME PAGE" });
// });

// server.get("/about", (req, res) => {
//   res.render("index", { title: "ABOUT PAGE" });
// });

// server.get("/contacts", (req, res) => {
//   res.render("index", { title: "CONTACS PAGE" });
// });

// catch not found errors
server.use((err, req, res, next) => {
  if (err.httpStatusCode === 404) {
    console.log(err);
    res.status(404).send("Resource not found!");
  }
  next(err);
});

// catch not found errors
server.use((err, req, res, next) => {
  if (err.httpStatusCode === 401) {
    console.log(err);
    res.status(401).send("Unauthorized!");
  }
  next(err);
});

// catch forbidden errors
server.use((err, req, res, next) => {
  if (err.httpStatusCode === 403) {
    console.log(err);
    res.status(403).send("Operation Forbidden");
  }
  next(err);
});

// catch all
server.use((err, req, res, next) => {
  if (!res.headersSent) {
    res.status(err.httpStatusCode || 500).send(err);
  }
});

console.log(listEndpoints(server));

server.listen(port, () => {
  // Server run and listen to connections on port 3000
  console.log(`Server is running on port ${port}`);
});
