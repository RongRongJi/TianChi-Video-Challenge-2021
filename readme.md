# “新内容 新交互”全球视频云创新挑战赛 - 创新应用赛道
## 赛事简介
本届全球视频云创新挑战赛是由阿里云联手英特尔主办，与优酷战略技术合作，面向企业以及个人开发者的音视频领域的数据算法及创新应用类挑战。本届大赛包括两个赛道：“算法挑战赛”和“创新应用挑战赛”，参赛选手可以自由报名参加任一赛道。选手可以在视频分割挑战以及视频创新应用领域中，发挥自己的创造力，探索视频云技术在互联网、零售、文娱、安防、文化、教育、金融、交通、公共安全、日常生活、公益等行业领域的应用。

大赛的创新应用赛道要求应用指定的相关技术，解决视频领域和相关行业的的痛点问题，实现应用场景的创新，以技术可行性/前瞻性/落地价值作为重要评审考察点。

赛事主页： https://tianchi.aliyun.com/competition/entrance/531868/introduction

## 《一起看视频》项目介绍

### 作者

* 刘劭荣@RongRongJi

* 王丰@pharra

### 决赛名次

* 亚军 + SG1最佳实践奖

### 赛题背景分析

受疫情影响，居家经济成为2020年来不可忽视的新经济形势。

居家经济是以家庭为活动空间发展起来的一系列经济产业链，其在一定时期依赖于互联网通信技术与物流业的发展。例如2003年的“非典”疫情，就间接推动了我国互联网通信技术的发展，阿里巴巴、百度、京东等一批互联网企业的调整与转型。新冠肺炎疫情发生以来，由于人们出行的诸多不便，全民居家对于基本生活物品需求量激增，各大生鲜电商平台、外卖平台火爆；由于企业和学校需要继续运转，在线教育、在线办公等线上协同能力被需求；人的精神层面，因为无法进行外出交流、聚会娱乐、远途旅游等传统活动，在线娱乐社交、手机游戏等被需求。疫情期间虽然线下实体店、餐饮、旅游等受损严重，但全民居家带热了以网络购物、餐饮外卖、线上娱乐、网络游戏为主的居家经济产业链。

### 核心思路

在这种疫情的大环境下，在线娱乐互动社交平台拥有着巨大的增长潜力。同时，我们选择了反应视频作为项目的核心元素。

这种视频形式最早起源于上世纪70年代的日本综艺节目，直至今日，不少日本的综艺仍然保留着这一演出方式，这种“小窗口嘉宾即时反应”也成为了日本综艺一大特色。2013年，反应视频随着电视剧在互联网上的热播，油管网友录制看剧时的激烈反应，引发了全球观众的集体共鸣。反应视频由此站上了互联网的舞台，并成为了多个视频平台的一个成熟且庞大的分支。目前，油管上最火的Reaction类频道，已经累计110亿次播放量，拥有2010万订阅粉丝。

但是，目前的反应视频形式存在着一些缺点。对于反应视频的博主来说，他们虽然发表了自己的观点，记录下了自己的反应，满足了分享欲，但是他们不能及时地得到反馈，收获不到认同感；对于观众群体，他们在看视频和弹幕时，收获了认同，却不能与这些志同道合的人及时互动。为了解决这个问题，我们提出了“视频+音视频通讯”的形式，将发布者和观众合二为一，提供及时地、双向地互动式观影体验。

从视频平台的发展历史来看，早期的视频平台只提供了文字评论功能，观众在观看视频后，可以在视频下方留下评论，再后来由评论进化的“弹幕”大行其道，现在几乎成为了所有视频平台的标配。在评论和弹幕的背后，隐藏的是观众群体所需的认同感和分享欲，在可预见的未来，随着视频云技术的普及，“反应视频”这种更加生动的互动形式势必会被广泛应用。而观众在观看视频的同时，实时分享自己的反应，也许会成为一个新的趋势。

详细比赛攻略 https://tianchi.aliyun.com/forum/postDetail?postId=246884

## 赛事资料

1. 获奖名单 https://tianchi.aliyun.com/competition/entrance/531868/rankingList
2. 阿里云rtc技术 https://www.aliyun.com/product/rtc
3. 阿里云视频点播技术 https://www.aliyun.com/product/vod

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

 
