// Importing the Wechaty npm package
import { Wechaty,WechatyBuilder, Contact, Message, ScanStatus, log } from "wechaty";
import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from "openai";
import { onScan, onLogin, onLogout, onMessage, onFriendship } from "./utils";
import dotenv from "dotenv";

dotenv.config();
console.log(process.env.OPENAI_API_KEY)


export function createBot(): Wechaty {
  return WechatyBuilder.build({
    name: "阿东",
  });
}


// config openAI
const configuration = new Configuration({
  organization: process.env.OPENAI_API_ORG,
  apiKey: process.env.OPENAI_API_KEY,
});
export const openai = new OpenAIApi(configuration);

// Initializing the bot
export const bot = createBot();

// Keep the conversation state
export const initState: Array<ChatCompletionRequestMessage> = new Array({ "role": "system", "content": "你是一个充满智慧，乐于助人的助手。" })

bot.on('scan',    onScan)
bot.on('login',   onLogin)
bot.on('logout',  onLogout)
bot.on('message', onMessage)
bot.on('friendship', onFriendship)

bot.start()
  .then(() => log.info('StarterBot', 'Starter Bot Started.'))
  .catch(e => log.error('StarterBot', e))

bot.ready()
  .then(() => log.info('StarterBot', 'Starter Bot Ready.'))
  .catch(e => log.error('StarterBot', e))