var ffmpeg = require("fluent-ffmpeg");
import path from "path";

export default {
  "POST ": async (ctx, next) => {
    ctx.body = ctx.request.body;
    const videoFile = ctx.request.files.file[0];
    const audioFile = ctx.request.files.file[1];
    console.log("ctx.body", ctx.request.files.file);
    ffmpeg()
      .input(videoFile["path"])
      .input(audioFile["path"])
      .format("avi")
      .output(
        path.join(__dirname, "/assets/upload/" + Date.now().toString() + ".avi")
      )
      .outputOptions("-init_hw_device qsv=hw -filter_hw_device hw")
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