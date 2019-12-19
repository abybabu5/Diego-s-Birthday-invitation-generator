const express = require("express");

const router = express.Router();

router.get("/nonExistant", (req, res, next) => {
  let err = new Error("I cannot find it"); // I'm creating a new error with a message
  err.httpStatusCode = 404; // I'm adding a status code 404 to the error object
  next(err); // This is sending the error with 404 status code to the error handler middleware
});

router.get("/forbiddenRoute", (req, res, next) => {
  let err = new Error("Forbidden!"); // I'm creating a new error with a message
  err.httpStatusCode = 403; // I'm adding a status code 403 to the error object
  next(err); // This is sending the error with 403 status code to the error handler middleware
});

module.exports = router;
