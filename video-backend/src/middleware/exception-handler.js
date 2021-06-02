import createError from 'http-errors'

export default function (ctx, next) {
  return next().catch(async e => {
    console.log(e)
    const err = new Error(e.message || e)
    err.status = e.status || 400
    err.headers = {
      'Access-Control-Allow-Origin': ctx.get('Origin'),
      'Access-Control-Allow-Headers':'Origin, X-Requested-With, Content-Type, Accept,Authorization',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
      'Access-Control-Allow-Methods': 'PUT, POST, GET, DELETE, OPTIONS,PATCH',
      'Access-Control-Allow-Credentials': true
    }
    err.expose = true

    throw err
  })
}
