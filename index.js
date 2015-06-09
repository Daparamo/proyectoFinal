var express   = 	require("express"),
	app		      = 	express(), 
	cons 	      =	  require("consolidate"), 
	puerto 	    = 	8081, 
	bodyParser 	=   require('body-parser'),
  http        =   require('http').Server(app),
  MongoClient =   require("mongodb").MongoClient,db;
 

 var Fecha = new Date();
 var FechaOrdenada = Fecha.getDate()+"/"+(Fecha.getMonth()+1)+"/"+Fecha.getFullYear()+" "+Fecha.getHours()+":"+Fecha.getMinutes();
  //Conectarse a la base de datos de MngoDB...
MongoClient.connect("mongodb://127.0.0.1:27017/MiComentarios", function(err, database)
{
  if(err) throw err;
  //Buscar un documento en la colección...
  db = database;  
});


//consolidate integra swig con express...
app.engine("html", cons.swig); //Template engine...
app.set("view engine", "html");
app.set("views", __dirname + "/vistas");
app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.get("/", function(req, res)
{
  res.render("index", {
    titulo  :   "Comentarios Udec"
  });
});

app.post("/Createcoment", function(req, res){
  var coleccion = db.collection("Comentarios");
  var datos = req.body;
  coleccion.count(function(err,count){
    datos.idcomentario = count+1;
    datos.like = 0;    
    datos.Fecha = FechaOrdenada;
    coleccion.insert(datos, function(err, records)
        {
          res.json({status : true});  
        });
    });
  
});  
app.get('/getData', function(req, res)
{
  var coleccion = db.collection("Comentarios");  
  var cursor = coleccion.find({}, {"sort" : ["idcomentario", "acs"]});
  cursor.toArray(function(err, doc)
  {
    if(err)
    {
      throw err;
    }
    res.json(doc);
  });
});

app.get('/like/:id', function(req, res)
{
    var query = {idcomentario : Number(req.param("id"))};
    var incrementa = {$inc : {"like" : 1}};
    var coleccion = db.collection("Comentarios");
    coleccion.update(query,incrementa,function(err,actualiza){
    var cursor = coleccion.find(query,{"_id" : false,"like" : true});
    cursor.toArray(function(err, doc)
  {
    if(err)
    {
      throw err;
    }
    res.json(doc);
  });
});
});

app.listen(puerto);
console.log("Express server iniciado en el " + puerto);