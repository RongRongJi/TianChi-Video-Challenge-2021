<template>
  <div>
    <div class="upload">
      <div>
        <input type="file" id="fileUpload" @change="fileChange($event)">
        <label class="status">上传状态: <span>{{statusText}}</span></label>
      </div>
      <div class="upload-type">
        上传方式一, 使用 UploadAuth 上传:
        <button @click="authUpload" :disabled="uploadDisabled">开始上传</button>
        <button @click="pauseUpload" :disabled="pauseDisabled">暂停</button>
        <button :disabled="resumeDisabled" @click="resumeUpload">恢复上传</button>
        <button @click="createSingle">进入房间</button>
        <span class="progress">上传进度: <i id="auth-progress">{{authProgress}}</i> %</span>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "UploadView",
  data() {
    return {
     // 上传视频相关
      timeout: '',
      partSize: '',
      parallel: '',
      retryCount: '',
      retryDuration: '',
      region: 'cn-shanghai',
      userId: '1685421628569033',
      file: null,
      authProgress: 0,
      uploadDisabled: true,
      resumeDisabled: true,
      pauseDisabled: true,
      uploader: null,
      statusText: '',
      videoId: '',
    };
  },
  created(){
    let arr = ["./aliyun-upload-sdk/lib/es6-promise.min.js",
      "./aliyun-upload-sdk/lib/aliyun-oss-sdk-6.13.0.min.js",
      "./aliyun-upload-sdk/aliyun-upload-sdk-1.5.2.min.js"];
    arr.map((item) => {
      let script = document.createElement("script");
      script.type = "text/javascript";
      script.src = item;
      document.getElementsByTagName("body")[0].appendChild(script);
    });
  },
  mounted() {
  },
  methods: {
        createSingle(){
            let channelName = Math.random().toFixed(5).slice(-5);
            let videoId = this.videoId
            videoId = '98c9edcd1cd94f62a0c5dc6d290cfa34'
            // 连接同步视频socket
            let socket = this.$socketio;
            this.$socketio.on("my_response", function (msg, cb) {
                console.log("socket_response", msg);
            });
            this.$socketio.emit("join", { room: channelName, videoId: videoId });
            const { path = "private_single" } = this.$route.query;
            this.$router.push({
                path: `/${path}`,
                query: { channelName, videoId },
            });
        },
        fileChange (e) {
        this.file = e.target.files[0]
        if (!this.file) {
          alert("请先选择需要上传的文件!")
          return
        }
        var Title = this.file.name
        var userData = '{"Vod":{}}'
        if (this.uploader) {
          this.uploader.stopUpload()
          this.authProgress = 0
          this.statusText = ""
        }
        this.uploader = this.createUploader()
        console.log(userData)
        this.uploader.addFile(this.file, null, null, null, userData)
        this.uploadDisabled = false
        this.pauseDisabled = true
        this.resumeDisabled = true
      },
      authUpload () {
        // 然后调用 startUpload 方法, 开始上传
        if (this.uploader !== null) {
          this.uploader.startUpload()
          this.uploadDisabled = true
          this.pauseDisabled = false
        }
      },
      // 暂停上传
      pauseUpload () {
        if (this.uploader !== null) {
          this.uploader.stopUpload()
          this.resumeDisabled = false
          this.pauseDisabled = true
        }
      },
      // 恢复上传
      resumeUpload () {
        if (this.uploader !== null) {
          this.uploader.startUpload()
          this.resumeDisabled = true
          this.pauseDisabled = false
        }
      },
      createUploader (type) {
        let self = this
        let uploader = new AliyunUpload.Vod({
          timeout: self.timeout || 60000,
          partSize: self.partSize || 1048576,
          parallel: self.parallel || 5,
          retryCount: self.retryCount || 3,
          retryDuration: self.retryDuration || 2,
          region: self.region,
          userId: self.userId,
          // 添加文件成功
          addFileSuccess: function (uploadInfo) {
            self.uploadDisabled = false
            self.resumeDisabled = false
            self.statusText = '添加文件成功, 等待上传...'
            console.log("addFileSuccess: " + uploadInfo.file.name)
          },
          // 开始上传
          onUploadstarted: function (uploadInfo) {
            // 如果是 UploadAuth 上传方式, 需要调用 uploader.setUploadAuthAndAddress 方法
            // 如果是 UploadAuth 上传方式, 需要根据 uploadInfo.videoId是否有值，调用点播的不同接口获取uploadauth和uploadAddress
            // 如果 uploadInfo.videoId 有值，调用刷新视频上传凭证接口，否则调用创建视频上传凭证接口
            // 注意: 这里是测试 demo 所以直接调用了获取 UploadAuth 的测试接口, 用户在使用时需要判断 uploadInfo.videoId 存在与否从而调用 openApi
            // 如果 uploadInfo.videoId 存在, 调用 刷新视频上传凭证接口(https://help.aliyun.com/document_detail/55408.html)
            // 如果 uploadInfo.videoId 不存在,调用 获取视频上传地址和凭证接口(https://help.aliyun.com/document_detail/55407.html)
            if (!uploadInfo.videoId) {
            axios
                .get("/server/api/createUpload",{
                  params:{
                      FileName: this.file.name,
                      Title: this.file.name}
              })
                .then((res) => {
                    let uploadAuth = res.data.UploadAuth
                    let uploadAddress = res.data.UploadAddress
                    let videoId = res.data.VideoId
                    self.videoId = videoId
                    uploader.setUploadAuthAndAddress(uploadInfo, uploadAuth, uploadAddress,videoId)                
                })
                .catch((err) => console.log(err));
              self.statusText = '文件开始上传...'
              console.log("onUploadStarted:" + uploadInfo.file.name + ", endpoint:" + uploadInfo.endpoint + ", bucket:" + uploadInfo.bucket + ", object:" + uploadInfo.object)
            } else {
              // 如果videoId有值，根据videoId刷新上传凭证
              // https://help.aliyun.com/document_detail/55408.html?spm=a2c4g.11186623.6.630.BoYYcY
              let refreshUrl = 'https://demo-vod.cn-shanghai.aliyuncs.com/voddemo/RefreshUploadVideo?BusinessType=vodai&TerminalType=pc&DeviceModel=iPhone9,2&UUID=59ECA-4193-4695-94DD-7E1247288&AppVersion=1.0.0&Title=haha1&FileName=xxx.mp4&VideoId=' + uploadInfo.videoId
              axios.get(refreshUrl).then(({data}) => {
                let uploadAuth = data.UploadAuth
                let uploadAddress = data.UploadAddress
                let videoId = data.VideoId
                uploader.setUploadAuthAndAddress(uploadInfo, uploadAuth, uploadAddress,videoId)
              })
            }
          },
          // 文件上传成功
          onUploadSucceed: function (uploadInfo) {
            console.log("onUploadSucceed: " + uploadInfo.file.name + ", endpoint:" + uploadInfo.endpoint + ", bucket:" + uploadInfo.bucket + ", object:" + uploadInfo.object)
            self.statusText = '文件上传成功!'
          },
          // 文件上传失败
          onUploadFailed: function (uploadInfo, code, message) {
            console.log("onUploadFailed: file:" + uploadInfo.file.name + ",code:" + code + ", message:" + message)
            self.statusText = '文件上传失败!'
          },
          // 取消文件上传
          onUploadCanceled: function (uploadInfo, code, message) {
            console.log("Canceled file: " + uploadInfo.file.name + ", code: " + code + ", message:" + message)
            self.statusText = '文件已暂停上传'
          },
          // 文件上传进度，单位：字节, 可以在这个函数中拿到上传进度并显示在页面上
          onUploadProgress: function (uploadInfo, totalSize, progress) {
            console.log("onUploadProgress:file:" + uploadInfo.file.name + ", fileSize:" + totalSize + ", percent:" + Math.ceil(progress * 100) + "%")
            let progressPercent = Math.ceil(progress * 100)
            self.authProgress = progressPercent
            self.statusText = '文件上传中...'
          },
          // 上传凭证超时
          onUploadTokenExpired: function (uploadInfo) {
            // 上传大文件超时, 如果是上传方式一即根据 UploadAuth 上传时
            // 需要根据 uploadInfo.videoId 调用刷新视频上传凭证接口(https://help.aliyun.com/document_detail/55408.html)重新获取 UploadAuth
            // 然后调用 resumeUploadWithAuth 方法, 这里是测试接口, 所以我直接获取了 UploadAuth
            let refreshUrl = 'https://demo-vod.cn-shanghai.aliyuncs.com/voddemo/RefreshUploadVideo?BusinessType=vodai&TerminalType=pc&DeviceModel=iPhone9,2&UUID=59ECA-4193-4695-94DD-7E1247288&AppVersion=1.0.0&Title=haha1&FileName=xxx.mp4&VideoId=' + uploadInfo.videoId
            axios.get(refreshUrl).then(({data}) => {
              let uploadAuth = data.UploadAuth
              uploader.resumeUploadWithAuth(uploadAuth)
              console.log('upload expired and resume upload with uploadauth ' + uploadAuth)
            })
            self.statusText = '文件超时...'
          },
          // 全部文件上传结束
          onUploadEnd: function (uploadInfo) {
            console.log("onUploadEnd: uploaded all the files")
            self.statusText = '文件上传完毕'
          }
        })
        return uploader
      }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
