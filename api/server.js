var express = require('express'),
    bodyParser = require('body-parser'),
    mongodb = require('mongodb'),
    multiparty = require('connect-multiparty'),
    fs = require('fs'),
    fsx = require('fs-extra')
    objectId = require('mongodb').ObjectID;

var app = express();

// body-parser
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(multiparty());

var port = 3000;

app.listen(port);

var db = new mongodb.Db(
    'instagram',
    new mongodb.Server('localhost', 27017, {}),
    {}
)

console.log('Servidor HTTP esta escutando na porta ' + port);

app.get('/',function(req,res)
{
    var resposta = {msg:'Olá'};
    res.send(resposta);
});

app.post('/api',function(req,res)
{
    res.setHeader("Access-Control-Allow-Origin","http://localhost:4000");

    var date = new Date();
    timeStamp = date.getTime();

    var url_imagem= timeStamp + "_" + req.files.arquivo.originalFilename;

    var pathOrigem = req.files.arquivo.path;
    var pathDestino = './uploads/' + url_imagem;


    fsx.move(pathOrigem,pathDestino, function(err){
        if(err){
            res.status(500).json({error: err});
            return;
        }else{
        
            var dados =  {
                url_imagem: url_imagem,
                titulo: req.body.titulo
            }            
            db.open(function(err, mongoclient)
            {
                mongoclient.collection('postagens', function(err,collection)
                {
                collection.insert(dados,function(err, records)
                    {
                    if(err)
                        {
                            res.json({'status' : 'erro'});
                        } else {
                            res.json({'status' : 'inclusao realizada com sucesso'});
                        }
                        mongoclient.close();
                    }); 
                });
            });
        }
    });   
});

app.get('/imagens/:imagem',function(req,res)
{
    res.setHeader("Access-Control-Allow-Origin","http://localhost:4000");
    var img = req.params.imagem;
    fs.readFile('./uploads/' + img, function(error, conteudo)
    {
        if(error){
            res.status(400).json(error);
            return;
        }
        res.writeHead(200,{'Content-type':'image/jpg'});
        res.end(conteudo);
        
    });
});


app.get('/api',function(req,res)
{
    var dados = req.body;
    res.setHeader("Access-Control-Allow-Origin","http://localhost:4000");

    db.open(function(err, mongoclient)
    {
        mongoclient.collection('postagens', function(err,collection)
        {
           collection.find().toArray(function(err, results)
            {
               if(err)
                {
                    res.json(err);
                } else{
                    res.status(200).json(results);
                }
                mongoclient.close();
            }); 
        });
    });
});

//GET by ID
app.get('/api/:id',function(req,res)
{
    var dados = req.body;

    db.open(function(err, mongoclient)
    {
        mongoclient.collection('postagens', function(err,collection)
        {
           collection.find(objectId(req.params.id) /*/é igual {_id:req.params.id} */).toArray(function(err, results)
            {
               if(err)
                {
                    res.status(200).json(err);
                } else{
                    res.json(results);
                }
                mongoclient.close();
            }); 
        });
    });
});


//PUT by ID
app.put('/api/:id',function(req,res)
{
    var dados = req.body;

    db.open(function(err, mongoclient)
    {
        mongoclient.collection('postagens', function(err,collection)
        {
           collection.update({_id: objectId(req.params.id)},
                                {$set: {titulo: req.body.titulo}},
                                {},
                function(err, records)
                {
                if(err)
                    {
                        res.json(err);
                    } else{
                        res.json(records);
                    }
                    mongoclient.close();
                }
            ); 
        });
    });
});

//DELETE by ID
app.delete('/api/:id',function(req,res)
{
    var dados = req.body;

    db.open(function(err, mongoclient)
    {
        mongoclient.collection('postagens', function(err,collection)
        {
           collection.remove({_id: objectId(req.params.id)},function(err, records)
                {
                if(err)
                    {
                        res.json(err);
                    } else{
                        res.json(records);
                    }
                    mongoclient.close();
                }
            ); 
        });
    });
});