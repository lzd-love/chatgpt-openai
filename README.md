# Wechaty ChatGPT

This is a wechaty implementation of ChatBot powered by OpenAI ChatGPT

## Setup

Modify `dotenv` file to add your openai_api_key as well as the service_token
```
OPENAI_API_KEY=""
WECHATY_PUPPET_SERVICE_TOKEN=""
```

```shell
npm install
mv dotenv .env
```

## Run

```shell
npm run start
```



 /**
   * 如何设置 Wechaty Puppet Provider：
   *
   *  1. 在实例化 Wechaty 时指定 `puppet` 选项（例如 `{ puppet: 'wechaty-puppet-whatsapp' }`，见下文）
   *  1. 将 `WECHATY_PUPPET` 环境变量设置为 Puppet NPM 模块名称（例如 `wechaty-puppet-whatsapp`）
   *
   * 您可以在本地使用以下提供程序：
   *  - wechaty-puppet-wechat（Web 协议，无需令牌）
   *  - wechaty-puppet-whatsapp（Web 协议，无需令牌）
   *  - wechaty-puppet-padlocal（Pad 协议，需要令牌）
   *  - 等等。请参见：<https://wechaty.js.org/docs/puppet-providers/>
   */
  // puppet: 'wechaty-puppet-whatsapp'

  /**
   * 您可以使用 wechaty puppet provider 'wechaty-puppet-service'
   *   它可以连接到远程 Wechaty Puppet Services
   *   以使用更强大的协议。
   * 从 https://wechaty.js.org/docs/puppet-services/ 了解有关服务（和 TOKEN）的更多信息
   */
  // puppet: 'wechaty-puppet-service'
  // puppetOptions: {
  //   token: 'xxx',
  // }