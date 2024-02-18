
## 场景
部分站点的cookie会过期，需要定时刷新上传至服务端，这个插件可以帮助你快速的获取cookie并上传至服务端

制作过程参考了：https://xiao.nu/opensource/chrome-edge-addons-help-you-snyc-browser-cookies-to-your-url.html

## 代码说明
采用的 chrome 插件的方式，语法是 manifest v3版本， 代码结构如下：
- manifest.json 插件的配置文件
- popup.html 插件的弹窗页面
- popup.js 插件的弹窗页面的js代码
- background.js 插件的后台代码
- content.js 插件的页面注入代码

## 使用方式

- 下载代码，解压到文件夹
- 打开浏览器插件设置页面 chrome://extensions/ ，并开启开发者模式 
- 添加本地代码(刚刚解压的目录)
- 设置插件起动即可

![page-view](https://github.com/jaydenjd/cookie-upload/blob/master/images/page_settings.jpg)


## python 服务端代码
```python
# -*- coding: utf-8 -*-
# @Time   : 2024/2/17 14:31
from fastapi import FastAPI
from fastapi import Request

app = FastAPI()
from loguru import logger


@app.post("/endpoint")
async def endpoint(request: Request):
    remote_ip = request.client.host
    params = dict(request.query_params)
    headers = dict(request.headers)
    body = await request.body()
    logger.info(f"{remote_ip} Headers: {headers}")

    if not headers.get("token"):
        logger.error(f"token is empty")
        return {"code": 1, "msg": "token is empty"}
    if headers.get("token") != "123456":
        logger.error(f"token is wrong")
        return {"code": 1, "msg": "token is wrong"}

    logger.info(f"{remote_ip} Parameters: {params}")
    logger.info(f"{remote_ip} Request Body: {body.decode()}")

    return {"code": 0, "msg": "success"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=18081)

```
