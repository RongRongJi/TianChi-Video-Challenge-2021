import Koa2 from 'koa'
import KoaBody from 'koa-body'
import KoaStatic from 'koa-static2'
import path from 'path'

import {
  System as SystemConfig, privateKey
} from './config'

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
      accessKeyId: '',
      accessKeySecret: '',
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

    ctx.set('Access-Control-Allow-Origin', ctx.get('Origin'))
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


app.listen(SystemConfig.API_server_port)

console.log('Now start API server on port ' + SystemConfig.API_server_port + '...')

export default app
