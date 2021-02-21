var express = require('express');
var opn = require('opn');
const bodyParser = require('body-parser');

var AWS = require("aws-sdk");
app = express(),
    port = process.env.PORT || 3000;

AWS.config.update({
    region: 'ap-south-1',
    accessKeyId: 'AKIA2PNU57XCCIMH2OXW',
    secretAccessKey: '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'
});

var cloudformation = new AWS.CloudFormation();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + ''));

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");


app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html')
});

app.get('/list', function(req, res) {
    var params = {
        StackStatusFilter: ["CREATE_COMPLETE", "CREATE_IN_PROGRESS"]
    };
    cloudformation.listStacks(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            res.render('index2', {
                data: data.StackSummaries
            })
        }

    });

});

app.post('/done', (req, res) => {
    let data = require('./temp.json');

    data.Parameters.KeyName.Default = req.body.keyname
    data.Parameters.InstanceType.Default = req.body.InstanceType
    data.Parameters.DBName.Default = req.body.DBName
    data.Parameters.DBUser.Default = req.body.DBuser
    data.Parameters.DBPassword.Default = req.body.DBpassword
    data.Parameters.DBRootPassword.Default = req.body.DBrootpassword
    data.Parameters.SSHLocation.Default = req.body.SSHLocation


    var params = {
        StackName: req.body.stackname,
        TemplateBody: JSON.stringify(data)
    };

    cloudformation.createStack(params, function(err, data) {

        if (err) console.log(err);

        cloudformation.waitFor('stackCreateComplete', { StackName: req.body.stackname }, function(err, data) {
            if (err) console.log(err);
            else {
                res.sendFile(__dirname + '/index1.html')

                opn(data.Stacks[0].Outputs[0].OutputValue);
            }
        })

    });
});

app.listen(port);