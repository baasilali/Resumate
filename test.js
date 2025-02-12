const fs = require('fs')
const pdfparse = require('pdf-parse')

const pdffile = fs.readFileSync('/Users/baasilali/Documents/baasilali_resume.pdf')

// get the information

pdfparse(pdffile).then(function (data) {
    console.log(data.numpages)
    console.log(data.info)
    console.log(data.text)
})
