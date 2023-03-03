const app = require("express")();
const upload = require("multer")({dest:"uploads/"});
const xlsx = require("xlsx")
const csvtojson = require("csvtojson")()
const json2csv = require("json2csv")
const json2xls = require("json2xls")

var fs = require('fs');
let PORT = 5000;
const languageMap = {
  "as": "assamese",
"bn": "bengali",
"en": "english",
"gu": "gujarati",
"hi": "hindi",
"kn": "kannada",
"ml": "malayalam",
"mr": "marathi",
"or": "odia",
"pa": "punjabi",
"ta": "tamil",
"te": "telugu",
"fr": "french",
"ru": "russian",
"es": "spanish",
"de": "german",
"doi": "dogri",
"bh": "maithili",
"sat": "santali",
"brx": "bodo",
"sd": "sindhi",
"sa": "sanskrit",
"ne": "nepali",
"mni": "manipuri",
"kok": "konkani",
"ks": "kashmiri",
"zu": "zulu",
"tw": "twi",
"so": "somali",
"sw": "swahili",
"ln": "lingala",
"am": "amharic",
"af": "afrikaans",
"uz": "uzbek",
"uk": "ukrainian",
"tr": "turkish",
"tg": "tajik",
"sk": "slovak",
"sl": "slovenian",
"sr": "serbian",
"ro": "romanian",
"pl": "polish",
"mn": "mongolian",
"hu": "hungarian",
"fa": "farsi",
"et": "estonian",
"cs": "czech",
"hr": "croatian",
"bg": "bulgarian",
"sq": "albanian",
"vi": "vietnamese",
"th": "thai",
"syl": "sylheti",
"ckb": "sorani",
"si": "sinhalese",
"ps": "pashto",
"mg": "malagasy",
"ms": "malay",
"lo": "lao",
"ku": "kurdish",
"id": "indonesia",
"km": "cambodian",
"my": "burmese",
"sv": "swedish",
"pt": "portuguese",
"no": "norwegian",
"mt": "maltese",
"it": "italian",
"is": "icelandic",
"el": "greek",
"nl": "dutch",
"fi": "finnish",
"da": "danish"
};
app.listen(PORT, () => {
  console.log("Server is running")
})

app.post("/upload/memory/xlsx2json", upload.any(), (req, res) => {
  let files = req.files
  let workBook = xlsx.readFile(files[0].path);
  let sheetNames = workBook.SheetNames
  let xlsxjsonData = xlsx.utils.sheet_to_json(workBook.Sheets[sheetNames[0]])
  let sourceLanguage = Object.keys(xlsxjsonData[0])[0];
  let targetLanguage = Object.keys(xlsxjsonData[0])[1];
  
  let result = {};
  for(let i = 0; i < xlsxjsonData.length; i++) {
    result[`segment${i}`] = xlsxjsonData[i];
  }
  let jsonData = {
    resources: result,
    sourceLanguage: sourceLanguage
  }
  res.send({data: jsonData})
})

app.post("/upload/memory/csv2json", upload.any(), async (req, res) => {
  let files = req.files;
  let result = await csvtojson.fromFile(files[0].path)
  let newData = {}
  for(let i = 0; i < result.length; i++) {
    newData[ `segment${i}`] = result[i]
  }
  console.log(newData)
  let sourceLanguage = Object.keys(result[0])[0];
  console.log(languageMap[sourceLanguage])
  console.log(sourceLanguage);
  let jsonData = {
    resource: newData,
    sourceLanguage: languageMap[sourceLanguage]
  }
  res.send(jsonData)
})

app.post("/upload/memory/json", upload.any(), async(req, res) => {
  let files = req.files;
    let fileContent = fs.readFileSync(files[0].path);
    let stringData = fileContent.toString();
    let result = JSON.parse(stringData);
    let sourceLanguage, targetLanguage;
    let resource = {}
    for(let i = 0; i < result.length; i++) {
      sourceLanguage = Object.keys(result[i])[0];
      if(sourceLanguage === '' || languageMap[sourceLanguage] === undefined) {
        res.send("File Format Error. Source is not present")
      } else {
        targetLanguage = Object.keys(result[i])[1];
        if(targetLanguage === '' || languageMap[targetLanguage]=== undefined) {
          res.send("File Format Error. Target is not present")
        }
      }
      resource[`segment${i}`] = result[i]
    }
    jsonData = {
      resource,
      sourceLanguage
    }
  res.send(jsonData)
})

app.post("/upload/memory/json2xls", upload.any(), async(req, res) => {
  let files = req.files;
  let fileContent = fs.readFileSync(files[0].path)
  let dataset = JSON.parse(fileContent)
  let result = new Promise((resolve, reject) => {
    try {
      let data = json2xls(dataset)
      resolve(data)
    } catch (error) {
      reject(error)
    }
  })
  let finalResult = await result
  fs.writeFileSync("dataxystshx.xlsx", finalResult, "binary")
  res.send(finalResult)
})

app.post("/upload/memory/json2csv", upload.any(), async(req, res) => {
  let files = req.files;
  let fileContent = fs.readFileSync(files[0].path)
  let dataset = JSON.parse(fileContent)
  let csvPromise = new Promise((resolve, reject) => {
    try {
      let data = json2csv.parse(dataset)
      resolve(data)
    } catch (error) {
      reject(error)
    }
  })
  let finalResult = await csvPromise
  fs.writeFileSync("data.csv", finalResult, "utf8")
  console.log(finalResult)
  res.send(finalResult)
})