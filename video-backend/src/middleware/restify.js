export default (ctx, next) => {
        // console.log(`Process API ${ctx.request.method} ${ctx.request.url}...`);
        ctx.restify = (data) => {
            ctx.response.type = 'application/json';
            ctx.response.body = data;
        }
        return next();
    }