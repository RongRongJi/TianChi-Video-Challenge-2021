## 运行说明

### 前端

* 《一起看视频》项目前端由vue.cli 4.x搭建，本地启动前请按以下步骤执行
* 添加阿里云用户的key以及secret
    * 在`video-together/src/core/data`目录下创建`config.js`，并补全以下内容

        ```javascript
            export default{
                appId:"",
                appKey:""
            }
        ```

* 安装依赖

```
npm install
```

* 本地启动

```
npm run serve
```

运行后通过 https://localhost:8020/ 进行访问

### 后端

* 《一起看视频》项目后端由nodejs+KOA框架搭建，运行前请按以下步骤操作
* 添加阿里云用户的key以及secret
    * 在`video-backend/src/`目录下创建`aliconfig.js`，并补全以下内容

        ```javascript
            export default{
                accessKeyId: '',
                accessKeySecret: '',
            }
        ```

* 安装依赖

```
npm install
```

* 需要编译安装FFmpeg的以下依赖
    * VA-API（Intel视频硬件编解码的开源解决方案）
    * Media-Driver（媒体驱动）
    * Intel Media SDK （Intel媒体软件开发套）
    * QSV （Intel的硬件加速技术）
    * Hardware accelerated H.264 decoding && encoding （H264 硬件加速模块）

* 本地启动

```
npm run start
```

 