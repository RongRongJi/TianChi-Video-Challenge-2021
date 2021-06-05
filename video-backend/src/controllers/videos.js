
export default {
  "POST ": async (ctx, next) => {
    let code = ctx.request.query.code;

    ctx.restify(r);
  },
  "DELETE ": async (ctx, next) => {},
  "GET ": async (ctx, next) => {
    let { name } = ctx.request.query;

    let client = ctx.vodClient;
    let r = await client.request(
      "GetPlayInfo",
      {
        VideoId: name,
      },
      {}
    );
    console.log("data", r);
    ctx.restify(r);
  },
};
