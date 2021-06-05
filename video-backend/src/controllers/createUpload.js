  
  export default {
    "POST ": async (ctx, next) => {
      let code = ctx.request.query.code;
      ctx.restify(r);
    },
    "DELETE ": async (ctx, next) => {},
    "GET ": async (ctx, next) => {
      let { FileName, Title} = ctx.request.query;

      let client = ctx.vodClient;
      let r = await client.request(
        "CreateUploadVideo",
        {
          "FileName": FileName,
          "Title": Title,
          "StorageLocation": "outin-0833bbd8909f11ebaae800163e1a3b4a.oss-cn-shanghai.aliyuncs.com"
        },
        {}
      );
      console.log("data", r);
      ctx.restify(r);
    },
  };
  