import fs from 'fs'
import KoaRouter from 'koa-router'
// add url-route in /controllers:
const router = new KoaRouter()

function addMapping(prefix,router, mapping) {
    for (var url in mapping) {
        if (url.startsWith('GET ')) {
            var path = prefix+url.substring(4);
            router.get(path, mapping[url]);
            console.log(`register URL mapping: GET ${path}`);
        } else if (url.startsWith('POST ')) {
            var path = prefix+url.substring(5);
            router.post(path, mapping[url]);
            console.log(`register URL mapping: POST ${path}`);
        } else if (url.startsWith('PUT ')) {
            var path = prefix+url.substring(4);
            router.put(path, mapping[url]);
            console.log(`register URL mapping: PUT ${path}`);
        } else if (url.startsWith('DELETE ')) {
            var path = prefix+url.substring(7);
            router.del(path, mapping[url]);
            console.log(`register URL mapping: DELETE ${path}`);
        }else if (url.startsWith('PATCH ')) {
            var path = prefix+url.substring(6);
            router.patch(path, mapping[url]);
            console.log(`register URL mapping: PATCH ${path}`);
        } else {
            console.error(`invalid URL: ${url}`);
        }
    }
}

function addControllers(router, dir) {
    fs.readdirSync(__dirname + '/' + dir).filter((f) => {
        return f.endsWith('.js');
    }).forEach((f) => {
        console.log(`process controller: ${f}...`);
        let mapping = require(__dirname + '/' + dir + '/' + f).default;
        let name = f.substring(0, f.length - 3);
        addMapping('/api/'+name,router, mapping);
    });
}

export default function () {
    let controllers_dir = 'controllers';
    addControllers(router, controllers_dir);
    return router.routes();
};