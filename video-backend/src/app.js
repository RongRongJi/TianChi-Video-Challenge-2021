import Koa2 from 'koa'
import KoaBody from 'koa-body'
import KoaStatic from 'koa-static2'
import path from 'path'

import {
  System as SystemConfig, privateKey
} from './config'
import access from './aliconfig'

import errorHandler from './middleware/exception-handler'
import routerLoader from './router-loader'
import restify from './middleware/restify'

var RPCClient = require('@alicloud/pop-core').RPCClient

const app = new Koa2()
const env = process.env.NODE_ENV || 'development' // Current mode


//初始化点播服务
const vodClient = (function initVodClient() {
  var regionId = 'cn-shanghai';   // 点播服务接入区域
  var client = new RPCClient({
      accessKeyId: access.accessKeyId,
      accessKeySecret: access.accessKeySecret,
      endpoint: 'http://vod.' + regionId + '.aliyuncs.com',
      apiVersion: '2017-03-21'
  });

  return client;
})()




if (env === 'development') { 
  app.use((ctx, next) => {
    const start = new Date()
    return next().then(() => {
      const ms = new Date() - start
      console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
    })
  })
}

app
  .use(async (ctx, next) => {
    // 
    ctx.vodClient = vodClient

    ctx.set('Access-Control-Allow-Origin', '*')
    ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept,Authorization')
    ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS,PATCH')
    ctx.set('Access-Control-Allow-Credentials', true) // 允许带上 cookie
    if (ctx.method == 'OPTIONS') {
      ctx.response.status = 200
    } else {
      return next()
    }

  })
  .use(errorHandler)
  .use(KoaStatic('assets', path.resolve(__dirname, '../assets'))) // Static resource
  .use(KoaBody({
    multipart: true,
    parsedMethods: ['POST', 'PUT', 'PATCH', 'GET', 'HEAD', 'DELETE'], // parse GET, HEAD, DELETE requests
    jsonLimit: '10mb',
    formLimit: '10mb',
    textLimit: '10mb'
  }))
  .use(restify)
  .use(routerLoader())




console.log('Now start API server on port ' + SystemConfig.API_server_port + '...')

const options = {
key: require('fs').readFileSync(path.join(__dirname, "../cert/server.key"), "utf8"),
cert: require('fs').readFileSync(path.join(__dirname, "../cert/server.cert"), "utf8")
};

const server = require('https').createServer(options,app.callback())
var io = require("socket.io")(server, { cors: true });
var video_id = {}

io.on('connection', function(socket){
  console.log('server socket connect')

  socket.on('join', function(msg){
    socket.join(msg['room'])
    console.log(msg)
    console.log(video_id)
    if (msg['id'] != undefined){  // 创建一个id房间
      video_id[msg['room']] = {'id': msg['id']}
      io.emit('my_response', {'data': msg['room']})
    }else if(video_id[msg['room']] !=undefined){  // 返回一个房间
      io.emit("id_response", { err: 1, data: video_id[msg["room"]] });
    }else if (msg['videoId'] != undefined){  // 创建一个video房间
      video_id[msg['room']] = {'videoId': msg['videoId']}
      io.emit('my_response', {'data':msg['room']})
    }else{
      io.emit("id_response", { err: 0 });
    }
  })

  socket.on('video_seeking', function(msg){
    io.to(msg['room']).emit('seeking_response',
      {'time':msg['time'], 'uid':msg['uid']})
  })

  socket.on('video_play', function(msg){
    io.to(msg['room']).emit('play_response',{'uid':msg['uid']})
  })

  socket.on('video_pause', function(msg){
    io.to(msg['room']).emit('pause_response',{'uid':msg['uid']})
  })

  socket.on('chat message', function(msg){
    io.to(msg['room']).emit('chat message',
    {'uid':msg['uid'], 'time':msg['time'], 'text':msg['text']})
  })
})

// app.listen()

server.listen(SystemConfig.API_server_port, () => {
    console.log('listening on *:5000');
});
export default app
