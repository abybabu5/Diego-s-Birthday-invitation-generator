const {Transform} = require("json2csv");

const SimpleCRUD = require("./SimpleCRUD");
const generatePDF = require("./users/lib/generate-pdf");
const {readFile, writeFile, createReadStream, existsSync} = require("fs-extra");
const {check, validationResult, sanitize} = require("express-validator");

class AttendeesCRUD extends SimpleCRUD {
    constructor(file) {
        super(file);
    }

    createPDF = async (req, res) => {
        try {
            console.log(req.params);
            const buffer = await readFile(this.filePath);
            const fileContent = buffer.toString();
            const usersArray = JSON.parse(fileContent);
            console.log(usersArray);
            const foundUser = usersArray.find(user => user._id === req.params.id);
            if (foundUser) {
                await generatePDF(foundUser); // I'm calling a function that is returning a promise so I can await for that
                res.setHeader("Location", "/pdf/" + req.params.id + ".pdf");
                res.status(302).send("/pdf/" + req.params.id + ".pdf");
            } else {
                res.status(404).send("NOT FOUND");
            }
        } catch (error) {
            console.log(error);
        }
    };

    getCSV = (req, res) => {
        const fields = ["name", "surname", "timeOfArrival", "email", "_id"];
        const opts = {fields};

        const json2csv = new Transform(opts);

        createReadStream(this.filePath)
            .pipe(json2csv)
            .pipe(res);
    };

    generateRoutes() {
        this.router.get("/pdf/:id", [sanitize("id").toInt()], this.createPDF);
        this.router.get("/csv", this.getCSV);
        return super.generateRoutes();
    }
}

module.exports = AttendeesCRUD;