var express = require('express'),
    bodyParser = require('body-parser'),
    mongodb = require('mongodb');

var app = express();

// body-parser
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

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
    var dados = req.body;

    db.open(function(err, mongoclient)
    {
        mongoclient.collection('postagens', function(err,collection)
        {
           collection.insert(dados,function(err, records)
            {
               if(err)
                {
                    res.json(err);
                } else{
                    res.json(records);
                }
                mongoclient.close();
            }); 
        });
    });
});