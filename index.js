const express= require("express");
const path= require("path");
const fs=require("fs");
const sass=require("sass");

app= express();
app.set("view engine", "ejs")


obGlobal={
    obErori:null,
    obImagini:null,
    folderScss: path.join(__dirname,"resurse/scss"),
    folderCss: path.join(__dirname,"resurse/css"),
    folderBackup: path.join(__dirname,"backup"),
    folderResurse: path.join(__dirname,"resurse"),
}

console.log("Folder index.js", __dirname);
console.log("Folder curent (de lucru)", process.cwd());
console.log("Cale fisier", __filename);

vect_foldere = ["temp", "logs", "backup", "fisiere_uploadate"];
for (let numeFolder of vect_foldere){
    let caleFolder = path.join(__dirname, numeFolder);
    if (!fs.existsSync(caleFolder)){
        fs.mkdirSync(caleFolder);
        console.log("Folder creat:", caleFolder);
    }
}

// 400 Bad Request
app.use(function(req, res, next){
    if (path.extname(req.path).toLowerCase() === ".ejs"){
        return afisareEroare(res, 400);
    }
    next();
});

//  403 Forbidden
app.use("/resurse", function(req, res, next){
    let calePeDisc = path.join(obGlobal.folderResurse, req.path);
    if (fs.existsSync(calePeDisc) && fs.statSync(calePeDisc).isDirectory()){
        return afisareEroare(res, 403);
    }
    next();
});

app.use("/resurse",express.static(path.join(__dirname, "resurse"))); /*toate caile care incep cu resurse */

app.get("/favicon.ico", function(req, res){
    res.sendFile(path.join(__dirname, "resurse/imagini/favicon/favicon.ico"));
});


app.get(["/", "/index","/home"], function(req, res){
    res.render("pagini/index");
});




function initErori(){
    let continut = fs.readFileSync(path.join(__dirname,"resurse/json/erori.json")).toString("utf-8");
    let erori = obGlobal.obErori = JSON.parse(continut)
    let err_default = erori.eroare_default
    err_default.imagine =path.join(erori.cale_baza, err_default.imagine)
    for (let eroare of erori.info_erori){
        eroare.imagine=path.join(erori.cale_baza, eroare.imagine)
    }
}
initErori()

function gasesteEroare(identificator){
    let eroare = obGlobal.obErori.info_erori.find(e => e.identificator === identificator)
    if (!eroare) {
        return {
            titlu: obGlobal.obErori.eroare_default.titlu,
            text: obGlobal.obErori.eroare_default.text,
            imagine: obGlobal.obErori.eroare_default.imagine,
            status: false
        }
    }
    return eroare
}

function afisareEroare(res, identificator, titlu, text, imagine){
    let eroare = gasesteEroare(identificator)
    if (eroare.status) {
        res.status(identificator)
    }
    res.render("pagini/eroare", {
        imagine: imagine || eroare.imagine,
        titlu: titlu || eroare.titlu,
        text: text || eroare.text
    })
}

app.get("/eroare", function(req, res){
    afisareEroare(res,404, "Titlu!!!")
});

function compileazaScss(caleScss, caleCss){
    if(!caleCss){

        let numeFisExt=path.basename(caleScss); // "folder1/folder2/a.scss" -> "a.scss"
        let numeFis=numeFisExt.split(".")[0]   /// "a.scss"  -> ["a","scss"]
        caleCss=numeFis+".css"; // output: a.css
    }
    
    if (!path.isAbsolute(caleScss))
        caleScss=path.join(obGlobal.folderScss,caleScss )
    if (!path.isAbsolute(caleCss))
        caleCss=path.join(obGlobal.folderCss,caleCss )
    
    let caleBackup=path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup,{recursive:true})
    }
    
    // la acest punct avem cai absolute in caleScss si  caleCss

    let numeFisCss=path.basename(caleCss);
    if (fs.existsSync(caleCss)){
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css",numeFisCss ))// +(new Date()).getTime()
    }
    rez=sass.compile(caleScss, {"sourceMap":true});
    fs.writeFileSync(caleCss,rez.css)
    
}


//la pornirea serverului
vFisiere=fs.readdirSync(obGlobal.folderScss);
for( let numeFis of vFisiere ){
    if (path.extname(numeFis)==".scss"){
        compileazaScss(numeFis);
    }
}


fs.watch(obGlobal.folderScss, function(eveniment, numeFis){
    if (eveniment=="change" || eveniment=="rename"){
        let caleCompleta=path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)){
            compileazaScss(caleCompleta);
        }
    }
})

app.get("/*splat", function(req, res){
    let pagina = req.path
    console.log("Cale pagina", pagina);

    res.render("pagini" + pagina, function(eroare, rezultatRandare){
        if (eroare){
            console.log("Eroare render:", eroare.message)
            if (eroare.message && eroare.message.includes("Failed to lookup view")){
                afisareEroare(res, 404)
            } else {
                afisareEroare(res, 1)
            }
        } else {
            res.send(rezultatRandare)
        }
    })
});

app.listen(8080, () => {
    console.log("Serverul a pornit!");
});


//localhost:8080
