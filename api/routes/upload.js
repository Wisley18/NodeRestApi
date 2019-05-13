const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');

//AWS VARIABLES
var akid = "AKIAITBAUP2QCN4555PQ";
var secret = "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";
var cloudFront = "https://d3qu8aq5ddqk3r.cloudfront.net";
//var bucket = "uploadvideola-source-hgrej4qx3y3e";
var bucket = "testesource";


router.post('/', (req, res, next) => {
    
    initAws();

    

    //initWorkerVideoConverter();

    var video = req.files.file;

    console.log(video);

    verificarConversaoVideo(video, res);

    // res.status(200).json({
    //     message: 'Upload Concluído',
    //     showVideo: true,
    //     videosource: generateStreamName(filename)
    // });
});



function initAws() {
    

    var httpOptions = {
        xhrAsync: true
    }

    AWS.config.update({ secretAccessKey: secret, accessKeyId: akid, httpOptions: httpOptions });

    //Media Store data
    s3SDK = new AWS.S3();
};

//Videoconverter.js https://bgrins.github.io/videoconverter.js/
//Worker Multithread https://braziljs.org/blog/javascript-multi-threading-com-web-workers-2/
function initWorkerVideoConverter() {

    convertionWorker = new Worker("converter.js");
};

//Função para construir ARGUMENTS de conversão
function parseArguments(text) {
    text = text.replace(/\s+/g, ' ');
    var args = [];
    // Allow double quotes to not split args.
    text.split('"').forEach(function (t, i) {
        t = t.trim();
        if ((i % 2) === 1) {
            args.push(t);
        } else {
            args = args.concat(t.split(" "));
        }
    });
    return args;
};

function verificarConversaoVideo(video, res) {

    console.log("START");

    var fileType = video.mimetype;

    console.log(fileType);
    
    var extension = video.name.slice((video.name.lastIndexOf(".") - 1 >>> 0) + 2);

    var isVideo = fileType.indexOf('video') > -1;
    var isMp4 = extension.indexOf('mp4') > -1;


    if (!isVideo) {
        alert("Envie um vídeo");
        return false;
    }

    if (isMp4) {
        upload(video, extension, res);
    } else {
        s9VideoReadvideo(video, extension, res);
    }
}


function s9VideoReadvideo(VIDEO, EXTENSION, res) {

    var reader = new FileReader();


    reader.addEventListener('load', function (loadEvent) {
        var buffer = loadEvent.target.result;
        sampleVideoData = new Uint8Array(buffer);
        //Call
        s9VideoConverter(sampleVideoData, EXTENSION, res);
    });

    reader.addEventListener('error', function (eEvent) {
        alert("Erro ao ler arquivo");
        return false;
    });

    reader.readAsArrayBuffer(VIDEO);
};

function s9VideoConverter(VIDEO, EXTENSION, res) {

    var commands = parseArguments("-i input." + EXTENSION + " -vf showinfo -strict -2 output." + conversionformat);
 
    var convertionWorker = new Worker("converter.js");

    console.log('After worker');
    
    //Worker EVENTS
    convertionWorker.onmessage = function (e) {

        var message = e.data;

        switch (message.type) {
            case "ready":
                console.log("READY ");
 
                break;
            case "stdout":							

                console.log("STDOUT ", message.data);

                break;

            case "stderr":
                console.log("STDERR ", message.data);
                break;

            case "done":							
                var buffers = message.data;
                if (buffers.length) console.log("CLOSED");

                buffers.forEach(function (file) {						
                    var fileBlob = new Blob([file.data], {type: 'video/mp4'} );																	
                    upload(fileBlob, "mp4", res);
                });

            case "exit":
                console.log("EXIT  Process exited with code " + message.data);
                break;
        }
    };

    //Worker ERROR Handler
    convertionWorker.onerror = function (event) {
        alert("ERRO AO CONVERTER");
        console.log("ERROR ", event.message);
    }

    //Worker POST
    convertionWorker.postMessage({
        type: "command",
        arguments: commands,
        files: [{
            "name": "input." + EXTENSION,
            "data": VIDEO
        }]
    });
}


function generateFilename() {
    var date = new Date();
    return date.getUTCDate().toString() + (date.getUTCMonth() + 1).toString() + date.getFullYear().toString() + date.getUTCHours().toString() + date.getUTCMinutes().toString() + date.getUTCSeconds().toString() + date.getUTCMilliseconds().toString();
}

//
//
function generateStreamName(filename) {
    var path = cloudFront + "/{0}/{1}/{2}.{3}";
    return path.replace("{0}", filename).replace("{1}", "hls").replace("{2}", filename).replace("{3}", "m3u8");
}

function upload(FILE, EXTENSION, res) {
								

    var filename = generateFilename();

    var params = {
        Body: FILE,
        Bucket: bucket,
        Key: filename + '.' + EXTENSION
    };

    var request = s3SDK.upload(params);

    console.log(request);

    res.status(200).json({
        message: 'Upload Concluído',
        status:'sucesso',
        showVideo: true,
        videosource: generateStreamName(filename)
    });

    // request
    //     .on('httpUploadProgress', function (evt) {
    //         var percentComplete = Math.round(evt.loaded * 100 / evt.total);
    //         $scope.status = percentComplete + "%";
    //         $scope.$apply();
    //     })
    //     .send();

    // request.promise()
    //     .then((res) => {
            
    //         res.status(200).json({
    //             message: 'Upload Concluído',
    //             status:'sucesso',
    //             showVideo: true,
    //             videosource: generateStreamName(filename)
    //         });
            
    //         // console.log("sucess", r);
    //         // $scope.status = "sucesso";
    //         // $scope.showVideo = true;
    //         // $scope.$apply();
    //         // $scope.videosource = generateStreamName(filename);
    //     })
    //     .catch(function (e) {

           

    //         // console.log("error ", e.data);
    //         // $scope.status = "Erro";
    //         // $scope.$apply();
    //     })
}

module.exports = router;