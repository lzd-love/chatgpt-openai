import { Contact, Message, ScanStatus, log, Friendship, Room } from "wechaty";
import { bot, openai, initState } from "./bot";
//import { bot, initState } from "./bot";
import { linkChatGPT } from "./api";
import markdownIt from 'markdown-it';
import { ChatCompletionRequestMessage } from "openai";
import { FileBox } from "file-box";
import qrTerm from "qrcode-terminal";
import nodeHtmlToImage from 'node-html-to-image';

const MEMORY_LIMIT = 50; // max memory
let conversation: { [key: string]: Array<ChatCompletionRequestMessage> } = {}; // conversation history for each contact

function convertMarkdownToHtml(markdown: string): string {
    const md = new markdownIt();
    return md.render(markdown);
}

export function onScan(qrcode: string, status: ScanStatus) {
    if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
        qrTerm.generate(qrcode, { small: true })  // show qrcode on console

        const qrcodeImageUrl = [
            'https://wechaty.js.org/qrcode/',
            encodeURIComponent(qrcode),
        ].join('')

        log.info('StarterBot', 'onScan: %s(%s) - %s', ScanStatus[status], status, qrcodeImageUrl)
    } else {
        log.info('StarterBot', 'onScan: %s(%s)', ScanStatus[status], status)
    }
}

export function onLogin(user: Contact) {
    log.info('StarterBot', '%s login', user)
}

export function onLogout(user: Contact) {
    log.info('StarterBot', '%s logout', user)
}

export async function onMessage(msg: Message) {
    log.info('StarterBot', msg.toString())

    const contact = msg.talker();
    const content = msg.text();
    const isText = msg.type() === bot.Message.Type.Text;
    if (!isText) { // ignore non-text messages
        return;
    }

    let conversationHistory = conversation[contact.id];
    if (!conversationHistory) {
        conversationHistory = [{ "role": "system", "content": "你是一个充满智慧，乐于助人的助手。" }];
        conversation[contact.id] = conversationHistory;
    }

    let room: Room | null | undefined = null;
    if (msg.room()) {
        room = await msg.room();
    }

    if (msg.self()) { // message from self
        if (conversationHistory.length === MEMORY_LIMIT) {
            // reset to initial state when reach the memory limit
            log.info("Resetting memory");
            conversationHistory = [];
            conversation[contact.id] = conversationHistory;
        }

        conversationHistory.push({ "role": "user", "content": content });
        const response = await openai.createChatCompletion({
        // const response = await linkChatGPT({
            model: "text-davinci-003",
            messages: conversationHistory,
            max_tokens: 200,
            temperature: 0.1,
            n: 1,
            stop: ['/n'],
            presence_penalty: 1,
            frequency_penalty: 1
        },{
            proxy:{
                host: '127.0.0.1',
                port: 7890
            }
        });

        try {
            const replyContent = response.data.choices[0].message!.content!;
            const html = convertMarkdownToHtml(replyContent);

            if (room) {
                await room.say(replyContent);
            } else {
                await contact.say(replyContent);
            }

            // record reply
            const reply: ChatCompletionRequestMessage = { "role": "assistant", "content": replyContent };
            conversationHistory.push(reply);
        } catch (e) {
            console.error(e);
        }
    } else { // message from others
        if (room) { // message from group chat
            if (await msg.mentionSelf()) { // message contains @ mention to self
                const mentionText = await msg.mentionText();
                const messageContent = content.replace(mentionText, "");
                const isImageCommand = messageContent.startsWith("/img ");
                const isTextCommand = messageContent.startsWith("/t ");
                const text = isImageCommand ? messageContent.replace("/img", "") : isTextCommand ? messageContent.replace("/t", "") : messageContent;

                if (conversationHistory.length === MEMORY_LIMIT) {
                    // reset to initial state when reach the memory limit
                    log.info("Resetting memory");
                    conversationHistory = [];
                    conversation[contact.id] = conversationHistory;
                }

                conversationHistory.push({ "role": "user", "content": text });
                const response = await openai.createChatCompletion({
                // const response = await linkChatGPT({
                    model: "gpt-3.5-turbo-0301",
                    messages: conversationHistory,
                    max_tokens: 200,
                    temperature: 0.1,
                    n: 1,
                    //stop: ['/n'],
                    presence_penalty: 1,
                    frequency_penalty: 1
                },{
                    proxy:{
                        host: '127.0.0.1',
                        port: 7890
                    }
                });

                try {
                    const replyContent = response.data.choices[0].message!.content!;
                    const html = convertMarkdownToHtml(replyContent);

                    if (isImageCommand) {
                        await nodeHtmlToImage({
                            output: './output.png',
                            html: html
                        });

                        log.info('The image was created successfully!');
                        const fileBox = FileBox.fromFile("./output.png");
                        await room.say(fileBox);
                    } else {
                        await room.say(`@${contact.name()} ${replyContent}`);
                        await contact.say(`@${contact.name()} ${replyContent}`);
                    }

                    // record reply
                    const reply: ChatCompletionRequestMessage = { "role": "assistant", "content": replyContent };
                    conversationHistory.push(reply);
                } catch (e) {
                    console.error(e);
                }
            }
        } else { // message from personal chat
            if (content.startsWith("阿东")) {
                const messageContent = content.replace("阿东", "");
                const isImageCommand = messageContent.startsWith("/img ");
                const isTextCommand = messageContent.startsWith("/t ");
                const text = isImageCommand ? messageContent.replace("/img", "") : isTextCommand ? messageContent.replace("/t", "") : messageContent;

                if (conversationHistory.length === MEMORY_LIMIT) {
                    // reset to initial state when reach the memory limit
                    log.info("Resetting memory");
                    conversationHistory = [];
                    conversation[contact.id] = conversationHistory;
                }

                conversationHistory.push({ "role": "user", "content": text });
                const response = await openai.createChatCompletion({
                // const response = await linkChatGPT({
                    model: "gpt-3.5-turbo",
                    messages: conversationHistory,
                    max_tokens: 200,
                    temperature: 0.1,
                    n: 1,
                    //stop: ['/n'],
                    presence_penalty: 1,
                    frequency_penalty: 1
                },{
                    proxy:{
                        host: '127.0.0.1',
                        port: 7890
                    }
                });

                try {
                    const replyContent = response.data.choices[0].message!.content!;
                    const html = convertMarkdownToHtml(replyContent);

                    if (isImageCommand) {
                        await nodeHtmlToImage({
                            output: './output.png',
                            html: html
                        });

                        log.info('The image was created successfully!');
                        const fileBox = FileBox.fromFile("./output.png");
                        await contact.say(fileBox);
                    } else {
                        await contact.say(`@${contact.name()} ${replyContent}`);
                    }

                    // record reply
                    const reply: ChatCompletionRequestMessage = { "role": "assistant", "content": replyContent };
                    conversationHistory.push(reply);
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }
}

export async function onFriendship(friendship: Friendship) {
    let logMsg;

    try {
        logMsg = "received `friend` event from " + friendship.contact().name();
        log.info(logMsg);

        switch (friendship.type()) {
            /**
             *
             * 1. New Friend Request
             *
             * when request is set, we can get verify message from `request.hello`,
             * and accept this request by `request.accept()`
             */

            case bot.Friendship.Type.Receive:
                logMsg = 'accepted automatically';
                log.info("before accept");
                await friendship.accept();

                // if want to send msg , you need to delay sometimes
                await new Promise((r) => setTimeout(r, 1000));
                await friendship.contact().say(`Hi ${friendship.contact().name()} from FreeChatGPT, I am your person asistant!\n你好 ${friendship.contact().name()} 我是你的私人助理阿东!`);
                console.log("after accept");
                break;

            /**
             *
             * 2. Friend Ship Confirmed
             *
             */
            case bot.Friendship.Type.Confirm:
                logMsg = "friendship confirmed with " + friendship.contact().name();
                break;

            default:
                break;
        }
    } catch (e) {
        console.error(e);
        logMsg = "Friendship try catch failed";
    }

    log.info(logMsg);
}