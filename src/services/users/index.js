const express = require("express");
const { readFile, writeFile, createReadStream } = require("fs-extra");
const path = require("path");
const { check, validationResult, sanitize } = require("express-validator");
const { Transform } = require("json2csv");

const generatePDF = require("./lib/generate-pdf");

const router = express.Router();

const filePath = path.join(__dirname, "users.json");

// const readFile = filePath => {
//   const buffer = fs.readFileSync(filePath); // read the file
//   const fileContent = buffer.toString();
//   return JSON.parse(fileContent);
// };
router.get("/pdf", async (req, res) => {
  try {
    await generatePDF(); // I'm calling a function that is returning a promise so I can await for that
    res.send("OK");
  } catch (error) {
    console.log(error);
  }
});

router.get("/:id", [sanitize("id").toInt()], async (req, res, next) => {
  // sanitize is used to parse id (string) into an integer
  // DO SOMETHING WITH REQUEST AND RESPONSE
  const buffer = await readFile(filePath);
  const fileContent = buffer.toString();
  const usersArray = JSON.parse(fileContent);
  const foundUser = usersArray.find(user => user._id === req.params.id); // req.params can access to the placeholder in the url (:id)

  if (!foundUser) {
    res.status(404).send(`Cannot find user with id ${req.params.id}`);
  } else {
    res.send(foundUser);
  }
}); // GET http:localhost:3000/users/1234 to READ a single user by id

router.get("/", async (req, res, next) => {
  try {
    // DO SOMETHING WITH REQUEST AND RESPONSE
    const buffer = await readFile(filePath);
    const fileContent = buffer.toString();
    const usersArray = JSON.parse(fileContent);
    if (req.query && req.query.name) {
      const filteredUsers = usersArray.filter(
        user =>
          user.hasOwnProperty("name") &&
          user.name.toLowerCase() === req.query.name.toLowerCase()
      );
      res.send(filteredUsers);
    } else {
      res.send(usersArray);
    }
    //res.render("users", { people: usersArray });
  } catch (error) {
    // if (error.code === "ENOENT") {
    //   next("SERVER ERROR - FILE NOT FOUND");
    // }
    next(error);
  }
}); // GET http:localhost:3000/users?name=john to LIST the users filtered by name

router.post(
  "/",
  [check("name").isLength({ min: 4 })],
  async (req, res, next) => {
    // check is a middleware from express-validator, it checks in multiple places like req.body, req.query, req.params, req.headers
    // DO SOMETHING WITH REQUEST AND RESPONSE

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const buffer = await readFile(filePath);
      const fileContent = buffer.toString();
      const usersArray = JSON.parse(fileContent);
      const newUser = {
        ...req.body,
        _id: usersArray.length + 1,
        createdAt: new Date()
      };
      usersArray.push(newUser);
      await writeFile(filePath, JSON.stringify(usersArray));
      res.status(201).send(`${newUser._id}`);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
); // POST http:localhost:3000/users/ to CREATE a single user

router.put("/:id", async (req, res, next) => {
  // DO SOMETHING WITH REQUEST AND RESPONSE
  const modifiedUser = req.body;
  const buffer = await readFile(filePath);
  const fileContent = buffer.toString();
  let usersArray = JSON.parse(fileContent);
  usersArray[Number.parseInt(req.params.id) - 1] = modifiedUser;
  await writeFile(filePath, JSON.stringify(usersArray));
  res.send(modifiedUser);
  //const userToModify = usersArray.filter( user =>  user._id === req.params.id)
}); // PUT http:localhost:3000/users/ to UPDATE a single user

router.delete("/:id", async (req, res, next) => {
  const buffer = await readFile(filePath);
  const fileContent = buffer.toString();
  const usersArray = JSON.parse(fileContent);
  const usersToBeKept = usersArray.filter(
    user => user._id !== Number.parseInt(req.params.id)
  );

  await writeFile(filePath, JSON.stringify(usersToBeKept));
  res.status(204);
  // DO SOMETHING WITH REQUEST AND RESPONSE
}); // DELETE http:localhost:3000/users/1234 to DELETE a single user

router.get("/:name/csv", (req, res) => {
  // users.json (src) --> json2csv --> res(csv)
  const filePath = path.join(__dirname, "./users.json");

  const fields = ["name", "surname", "_id"];
  const opts = { fields };

  const json2csv = new Transform(opts);

  createReadStream(filePath)
    .pipe(json2csv)
    .pipe(res);
});

module.exports = router;
