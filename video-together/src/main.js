import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import VideoPlayer from "vue-video-player";
require("video.js/dist/video-js.css");
require("vue-video-player/src/custom-theme.css");
import Axios from "axios";
import ChatView from "./components/chat/chat.vue";
import VideoPage from "./components/video/index.vue";
import CanvasView from "./components/canvas/index.vue";
import { io } from "socket.io-client";
import "aliyun-webrtc-sdk";

Vue.use(ElementUI);
Vue.use(VideoPlayer);
Vue.component("ChatView", ChatView);
Vue.component("VideoPage", VideoPage);
Vue.component("CanvasView", CanvasView);
Vue.config.productionTip = false;

const tls = `-----BEGIN CERTIFICATE-----
MIIDazCCAlOgAwIBAgIUFWoZj0kzesb4mEMtjBVAWLOfzAgwDQYJKoZIhvcNAQEL
BQAwRTELMAkGA1UEBhMCQVUxEzARBgNVBAgMClNvbWUtU3RhdGUxITAfBgNVBAoM
GEludGVybmV0IFdpZGdpdHMgUHR5IEx0ZDAeFw0yMTA2MDMxNDEyNDBaFw0yMTA3
MDMxNDEyNDBaMEUxCzAJBgNVBAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEw
HwYDVQQKDBhJbnRlcm5ldCBXaWRnaXRzIFB0eSBMdGQwggEiMA0GCSqGSIb3DQEB
AQUAA4IBDwAwggEKAoIBAQDUshz9z7MCa461Dbow8LR4Mk2af8qQucR/+3tsIFvv
CNOB7tNmK3lMsOk5MUoQKfuc95cXY6WyuzLRHIq4DT98G+XwEUKTtuQZhpTMdMnK
7C+uY74d/sp+GTwjRo0Xp+C1bw4MW7LFEYHLHdPbnmOtUAKAH8KIf2ybSW4pLtRP
2ZOwesCUvwnV3fKpGAxD0TgkLBQmDfMG2xCqJcGirj/OqTv4nvQT4gYhi9ud1vH4
aUbRNZDCuaAodM8FBmy0pmwfFUsfv/VDOtyTtCy1JAYKtEcgpBnxlwO+JVHpIUr6
5SiM4EkhiUQFZNoVieM4YgxiwW40E3cGifd8eUyqHjCrAgMBAAGjUzBRMB0GA1Ud
DgQWBBRmIGeILaY19MrkR4T8jQgtG9db9DAfBgNVHSMEGDAWgBRmIGeILaY19Mrk
R4T8jQgtG9db9DAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQB8
bgb9JgkYEMgNf+Yj8IvvqkU1dWzvcUItXWWU/cBcRSf7ObMZ6lN19IIzVwA4pGIp
JhcXUdWAHkAmaZTd1CpvDEIl1V88VCcxfQt91mHCDybgXErL7BReugrU94zXEvqy
/BFyNIrsVT9wE6bPFybfGxDwRL/O40icZfLC22M1XmT6qFIPYD6mNs2zfBNSIeJH
Hr8zjTlXnVRlUjhBb47HCz3+HRvjRHyja9VK/7Dnoo1+Gnw6WqUdOBAvB7X67rRl
Dxk0WHKwOoWEbpjz3hLOfdYRDmu6aIc8FryxvvUHseEkgQ7NKQrpumLeqBE02Zpl
D3hlhGVZ1UeDJEuMAMPD
-----END CERTIFICATE-----
`;

var socket = io("https://localhost:5000", { ca: tls });
Vue.prototype.$socketio = socket;

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
