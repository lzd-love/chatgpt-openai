import axios from "axios";
import { CreateChatCompletionResponse } from 'openai/dist/api'

export function linkChatGPT(parameter: object): Promise<import("axios").AxiosResponse<CreateChatCompletionResponse, any>>{

    return axios.request({
        method: 'post',
        maxBodyLength: 4000,
        timeout: 50000,
        url: 'https://api.openai.com/v1/chat/completions',
        // url: `localhost:${process.env.PORT}/openai`,
        
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'openai-organization': 'org-DGAkWgRhfx3r91uIppLH3Knt',
            'user-agent': ' Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 Edg/111.0.1661.51',
            'access-control-request-headers': 'authorization,content-type,openai-organization'
        },
        proxy:{
            protocol: 'https',
            host: '127.0.0.1',
            port: 7890
        },
        data: parameter
    })
}