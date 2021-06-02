
async function getVideoURL(client, videoId) {
    let r = {
        urls: []
    }

    try {
        let response = await client.request("GetPlayInfo", {
            VideoId: videoId
        }, {})
        if (response.PlayInfoList && response.PlayInfoList.PlayInfo && response.PlayInfoList.PlayInfo.length > 0) {
            for (var i = 0; i < response.PlayInfoList.PlayInfo.length; i++) {
                r.urls.push(response.PlayInfoList.PlayInfo[i].PlayURL)
            }
        }
        // base metadata
        if (response.VideoBase) {
            r.title = VideoBase.Title
        }
        r.RequestId = response.RequestId
    } catch (response) {
        console.log('Error Response' + JSON.stringify(response));

    }

}

const fs = require('fs')
const path = 'static/info.json'

function getInfo(name){
    let ret = "none";
    let data = fs.readFileSync(path, 'utf-8')
    let video_list = data.toString();
    video_list = JSON.parse(video_list)
    let list = video_list['movie_list']
    for(var i=0;i<list.length;i++){
        if(list[i].name == name){
            ret = list[i]
            return ret
        }
    }
    list = video_list['game_list']
    for(var i=0;i<list.length;i++){
        if(list[i].name == name){
            ret = list[i]
            return ret
        }
    }
    return ret
}

export default {
    'POST ': async (ctx, next) => {
        let code = ctx.request.query.code

        ctx.restify(r)
    },
    'DELETE ': async (ctx, next) => {

    },
    'GET ': async (ctx, next) => {
        let { name } = ctx.request.query

        console.log(name)
        let data = getInfo(name)
        console.log(data)
        if(data=="none"){
            ctx.restify(JSON.stringify({msg:'video doesn\'t exist'}))
            return
        }
        let client = ctx.vodClient
        let r = await client.request("GetPlayInfo", {
            VideoId: data.videoId
        }, {})
        data.playInfo = r
        console.log('r',r)
        ctx.restify(data)

    }
}