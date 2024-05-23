
## 介绍
这是一个浏览器插件，可用于提取站点的cookie并上传至服务端，用于同步浏览器的cookie

适用场景：部分站点的cookie会过期，需要定时刷新上传至服务端

适用浏览器：chrome, edge

制作过程参考了：[chrome/edge浏览器插件：一个定时自动刷新页面并同步cookies到指定url的工具](https://xiao.nu/opensource/chrome-edge-addons-help-you-snyc-browser-cookies-to-your-url.html) 。
但该插件是 v2版本，可能会在不久的将来会被官方弃用， 所以我重新写了一个v3版本的插件。

注意：该插件并不是直接获取浏览器的cookie，而是通过插件的方式，注入到页面中，然后获取页面的cookie，然后上传至服务端。如果需要手动提取，推荐使用插件 [EditThisCookie](https://chromewebstore.google.com/detail/cookie-editor/hlkenndednhfkekhgcdicdfddnkalmdm?hl=zh-CN&utm_source=ext_sidebar)。

## 代码说明
采用的 chrome 插件的方式，语法是 manifest v3版本， 代码结构如下：
- manifest.json 插件的配置文件
- popup.html 插件的弹窗页面
- popup.js 插件的弹窗页面的js代码
- background.js 插件的后台代码
- content.js 插件的页面注入代码

## 使用方式

- 下载代码，解压到文件夹
- 打开浏览器插件设置页面 [chrome://extensions/](chrome://extensions/)，并开启开发者模式 
- 添加本地代码(刚刚解压的目录)
- 设置插件起动即可

![page-view](https://github.com/jaydenjd/cookie-upload/blob/master/images/page_setting.jpg)


## python 服务端代码
```python
import json
from typing import Optional

from fastapi import FastAPI
from fastapi import Request
from pydantic import BaseModel

app = FastAPI()
from loguru import logger


# 自定义一个 Pydantic 模型
class Item(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    tax: Optional[float] = None


@app.post("/cookie_etract")
async def endpoint(request: Request):
    remote_ip = request.client.host
    params = dict(request.query_params)
    headers = dict(request.headers)
    from urllib.parse import parse_qs
    body = await request.body()
    logger.info(f"{remote_ip} Headers: {json.dumps(headers, ensure_ascii=False)}")
    token = headers.get("x-token")

    if not token:
        logger.error(f"token is empty")
        return {"code": 1, "msg": "token is empty"}
    if token != "123456":
        logger.error(f"token is wrong")
        return {"code": 1, "msg": "token is wrong"}

    logger.info(f"{remote_ip} Parameters: {json.dumps(params, ensure_ascii=False)}")
    body  = dict(parse_qs(body.decode()))
    logger.info(f"{remote_ip} Request Body: {json.dumps(body, ensure_ascii=False)}")

    return {"code": 0, "msg": "success"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=18081)
```
