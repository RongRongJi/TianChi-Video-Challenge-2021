var ffmpeg = require("fluent-ffmpeg");
import path from "path";
const fs = require('fs')

export default {
  "POST ": async (ctx, next) => {
    ctx.body = ctx.request.body;
    const videoFile = ctx.request.files.file[0];
    const audioFile = ctx.request.files.file[1];
    const title = ctx.request.body.title;
    const imageFile = ctx.request.files.image;
    console.log("ctx.body", ctx.request.body);
    const currentTime = Date.now().toString()
    const imgPath = path.join(__dirname, "../../assets/resources/"+currentTime+".jpg")
    const reader = fs.createReadStream(imageFile.path);
    const upStream = fs.createWriteStream(imgPath)
    reader.pipe(upStream)
    const aviPath = "../../assets/upload/" + currentTime + ".avi"

    fs.readFile('assets/reaction.json', function(err, data){
        if(err){
            return console.error(err);
        }
        let reaction = data.toString();
        reaction = JSON.parse(reaction);
        reaction.push({
            "title": title,
            "image": 'assets/resources/'+currentTime+'.jpg',
            "video": 'assets/upload/'+currentTime+'.avi'
        })
        let str = JSON.stringify(reaction)
        fs.writeFile('assets/reaction.json', str, function(err){
            if(err){
                console.error(err)
            }
        })
    })

    ffmpeg()
      .input(videoFile["path"])
      .input(audioFile["path"])
      .format("avi")
      .output(
        path.join(__dirname, aviPath)
      )
      .inputOptions([
        "-y",
        "-init_hw_device qsv=hw",
        "-filter_hw_device hw",
        "-hwaccel qsv",
        "-hwaccel_output_format qsv",
      ])
      .on("error", function (err) {
        console.log("An error occurred: " + err.message);
      })
      .on("end", function () {
        console.log("Processing finished !");
      })
      .run();
  },
  "DELETE ": async (ctx, next) => {},
  "GET ": async (ctx, next) => {
    console.log(ctx);
    //ctx.restify(r)
  },
};
