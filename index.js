const express= require("express");
const path= require("path");

app= express();
app.set("view engine", "ejs")

console.log("Folder index.js", __dirname);
console.log("Folder curent (de lucru)", process.cwd());
console.log("Cale fisier", __filename);

app.get("/", function(req, res){
    res.sendFile(path.join(__dirname, "index.html"));
});

//app.get("/", function(req, res){
  //  res.render("pagini/index")
//});


app.get ("/cale", function(req, res){
    console.log ("Am primit o cerere GET la addresa /cale");
    res.send("Raspuns la cererea GET la adresa /cale");
});



app.get ("/cale2", function(req, res){
    res.write("ceva");
    res.write("altceva");
    res.end();
});

app.use("/resurse", express.static(path.join(__dirname, "resurse")));

//app.listen(8080);
//console.log("Serverul a pornit!");
app.listen(8080, () => {
    console.log("Serverul a pornit!");
});


//localhost:8080