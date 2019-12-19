const express = require("express");
const {readFile, writeFile, createReadStream, existsSync} = require("fs-extra");
const path = require("path");
const {check, validationResult, sanitize} = require("express-validator");

class SimpleCRUD {
    filePath = "";

    router = express.Router();

    constructor(file) {
        this.filePath = path.join(__dirname, file);
        if (!existsSync(this.filePath)) {
            writeFile(this.filePath, "[]");
        }
    }

    getById = async (req, res, next) => {
        // sanitize is used to parse id (string) into an integer
        // DO SOMETHING WITH REQUEST AND RESPONSE
        const buffer = await readFile(this.filePath);
        const fileContent = buffer.toString();
        const usersArray = JSON.parse(fileContent);
        const foundUser = usersArray.find(user => user._id === req.params.id); // req.params can access to the placeholder in the url (:id)

        if (!foundUser) {
            res.status(404).send(`Cannot find object with id ${req.params.id}`);
        } else {
            res.send(foundUser);
        }
    };

    getAll = async (req, res, next) => {
        try {
            // DO SOMETHING WITH REQUEST AND RESPONSE
            const buffer = await readFile(this.filePath);
            const fileContent = buffer.toString();
            const usersArray = JSON.parse(fileContent);
            console.log(req.query);
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
    };

    addOne = async (req, res, next) => {
        // check is a middleware from express-validator, it checks in multiple places like req.body, req.query, req.params, req.headers
        // DO SOMETHING WITH REQUEST AND RESPONSE

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const buffer = await readFile(this.filePath);
            const fileContent = buffer.toString();
            const usersArray = JSON.parse(fileContent);
            const newUser = {
                ...req.body,
                _id: Date.now(),
                createdAt: new Date()
            };
            usersArray.push(newUser);
            await writeFile(this.filePath, JSON.stringify(usersArray));
            res.status(201).send(`${newUser._id}`);
        } catch (error) {
            console.log(error);
            next(error);
        }
    };

    modifyOne = async (req, res, next) => {
        // DO SOMETHING WITH REQUEST AND RESPONSE
        const modifiedUser = req.body;
        const buffer = await readFile(this.filePath);
        const fileContent = buffer.toString();
        let usersArray = JSON.parse(fileContent);
        const index = usersArray.findIndex((user) => user._id === req.params.id);
        usersArray[index] = Object.assign(usersArray[index], modifiedUser);
        await writeFile(this.filePath, JSON.stringify(usersArray));
        res.send(usersArray[index]);
        //const userToModify = usersArray.filter( user =>  user._id === req.params.id)
    };

    deleteOne = async (req, res, next) => {
        const buffer = await readFile(this.filePath);
        const fileContent = buffer.toString();
        const usersArray = JSON.parse(fileContent);
        const usersToBeKept = usersArray.filter(
            user => user._id !== Number.parseInt(req.params.id)
        );

        await writeFile(this.filePath, JSON.stringify(usersToBeKept));
        res.status(204).send();
        // DO SOMETHING WITH REQUEST AND RESPONSE
    };

    generateRoutes()  {
        this.router.get("/:id", [sanitize("id").toInt()], this.getById);
        this.router.get("/",  this.getAll);
        this.router.post("/",  this.addOne);
        this.router.put("/:id", [sanitize("id").toInt()], this.modifyOne);
        this.router.delete("/:id", [sanitize("id").toInt()], this.deleteOne);
        return this.router;
    }
}

module.exports = SimpleCRUD;