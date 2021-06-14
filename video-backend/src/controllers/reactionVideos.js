
const fs = require('fs')
const path = 'assets/reaction.json'

function getReaction(){
    let data = fs.readFileSync(path, 'utf-8')
    let reactions = data.toString();
    reactions = JSON.parse(reactions)
    return reactions
}

export default {
    'POST ': async (ctx, next) => {
        let code = ctx.request.query.code

        ctx.restify(r)
    },
    'DELETE ': async (ctx, next) => {

    },
    'GET ': async (ctx, next) => {
        let data = getReaction()
        ctx.restify(data)

    }
}