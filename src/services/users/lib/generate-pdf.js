const PdfPrinter = require("pdfmake");
const path = require("path");
const process = require("process");
const fs = require("fs-extra");

const generatePDF = (user) =>
    new Promise((resolve, reject) => {
        // I'm returning a Promise because I want to await to the process of creating a PDF
        try {
            // Define font files
            var fonts = {
                Roboto: {
                    normal: 'Courier',
                    bold: 'Courier-Bold',
                    italics: 'Courier-Oblique',
                    bolditalics: 'Courier-BoldOblique'
                },
            };
            const printer = new PdfPrinter(fonts); // create new PDF creator
            const docDefinition = {
                // In here we define what we want to put into our PDF
                content: [
                    {text: 'Diego\'s Birthday Ticket', fontSize: 40, margin: [0, 50, 0, 50]},
                    {text: 'Attendee: ' + user.name + " " + user.surname, fontSize: 28, margin: [0, 0, 0, 20]},
                    {text: 'EMAIL: ' + user.email, fontSize: 18, margin: [0, 0, 0, 50]},
                    {qr: user._id + "", fit: 200},
                ],
                footer: {
                    columns: [
                        '',
                        {text: 'ticket created on: ' + user.createdAt, alignment: 'right', margin: [0, 0, 20, 0]}
                    ]
                }
            };

            // We will be using streams to create the pdf file on disk
            const pdfDoc = printer.createPdfKitDocument(docDefinition, {}); // pdfDoc is our source stream
            pdfDoc.pipe(fs.createWriteStream(path.join(process.cwd() + "/public/pdf", user._id + ".pdf"))); // we pipe pdfDoc with the destination stream, which is the writable stream to write on disk
            pdfDoc.end();
            resolve(); // the promise is satisfied when the pdf is successfully created
        } catch (error) {
            console.log(error);
            reject(error); // if we are having errors we are rejecting the promise
        }
    });

module.exports = generatePDF;
