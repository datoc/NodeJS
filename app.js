var http = require("http");
var formidable = require("formidable");
var fs = require("fs");
var mongodb = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/";

var server = http.createServer(function(request, response) {
    var form = new formidable.IncomingForm();

    form.parse(request, function(err, fields, files) {
        if(request.url == "/check") {
            mongodb.connect(url, { useUnifiedTopology: true }, function(err, db) {
                if(err) {
                    response.writeHead(200, {"Content-type" : "text/html"});
                    response.write("database not connected");
                    response.end();
                }else {
                    response.writeHead(200, {"Content-type" : "text/html"});
                    response.write("database connected");
                    response.end();
                }
            });
        }

        if(request.url == "/") {
            fs.readFile("index.html", function(err, data) {
                response.writeHead(200, {"Content-type" : "text/html"});
                response.write(data);
                response.end();
            });
        }else if(request.url == "/insert" && request.method == "POST") {
            mongodb.connect(url, { useUnifiedTopology: true }, function(err, db) {
                var dbo = db.db("mydb");
                var query = {
                    name : fields.name,
                    lastname : fields.lastname,
                    password : fields.password 
                };

                dbo.collection("users").insertOne(query, function(err, resp) {
                    if(err) {
                        response.writeHead(200, {"Content-type" : "text/html"});
                        response.write("data not inserted");
                        response.end();
                    }else {
                        response.writeHead(200, {"Content-type" : "text/html"});
                        response.write("data inserted");
                        response.end();
                    }
                });
            });
        }

        if(request.url == "/users") {
            mongodb.connect(url, { useUnifiedTopology: true }, function(err, db) {
                var dbo = db.db("mydb");
                dbo.collection("users").find({}).toArray(function(error, result) {
                    if(error) {
                        response.writeHead(200, {"Content-type" : "text/html"});
                        response.write("No data");
                        response.end();
                        db.close();
                    }else {
                        response.writeHead(200, {"Content-type" : "text/html"});
                        response.write("<link rel=\"stylesheet\" href=\"https:\/\/maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css\">");
                        response.write("<table class=\"table table-hover\"><tr><th>Name</th><th>Lastname</th><th>Password</th></tr>");

                        for(var i = 0; i < result.length; i++) {
                            response.write(`<tr><th>${result[i].name}</th><th>${result[i].lastname}</th><th>${result[i].password}</th></tr>`)
                        }

                        response.write("</table>")
                        response.end();
                        db.close();
                    }
                });
            });
        }
    });
});

server.listen(3000, function(err) {
    if(err) throw err;
    else console.log("Server is running...");
});