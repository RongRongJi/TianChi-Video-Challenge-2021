export default {
    'POST ': async (ctx, next) => {
        ctx.body = ctx.request.body
        console.log('ctx.body', ctx.request.files)
    },
    'DELETE ': async (ctx, next) => {

    },
    'GET ': async (ctx, next) => {

        console.log(ctx)
        //ctx.restify(r)

    }
}