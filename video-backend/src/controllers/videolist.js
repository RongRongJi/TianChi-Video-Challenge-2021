
const fs = require('fs')
const path = 'static/info.json'

function getVideoList(){
    let data = fs.readFileSync(path, 'utf-8')
    let video_list = data.toString();
    video_list = JSON.parse(video_list)
    return video_list
}

export default {
    'POST ': async (ctx, next) => {
        let code = ctx.request.query.code

        ctx.restify(r)
    },
    'DELETE ': async (ctx, next) => {

    },
    'GET ': async (ctx, next) => {
        let data = getVideoList()
        ctx.restify(data)

    }
}