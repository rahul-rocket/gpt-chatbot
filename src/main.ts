import * as dotenv from "dotenv";
dotenv.config();

import express from 'express';
import http from 'http';
import { Server } from "socket.io";
import { ChatCompletionRequestMessageRoleEnum, OpenAIApi } from 'openai';

import openAIConfig from "./config/openai";

/**
 * Bootstrap gpt chatbot app
 */
async function bootstrap() {

    const app = express();
    const server = http.createServer(app);
    const io = new Server(server);
    const port = process.env.PORT || 3000;

    app.use(express.static("./public"));

    const openAI: OpenAIApi = new OpenAIApi(openAIConfig());

    io.on("connection", (socket) => {
        // Initialize the conversation history
        const messages: any[] = [];
        console.log("New user connected", socket);

        socket.on("sendMessage", async (message, callback) => {
            try {
                /** Add the user message to the conversation history */
                messages.push({
                    role: ChatCompletionRequestMessageRoleEnum.User,
                    content: message
                });
                
                const completion = await openAI.createChatCompletion({
                    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
                    messages: messages,
                });
                const content = completion?.data?.choices[0]?.message?.content;
                /**
                 * Add the assistant's response to the conversation history
                 */
                messages.push({
                    role: ChatCompletionRequestMessageRoleEnum.Assistant,
                    content: content
                });
                socket.emit("message", content);
                callback();
            } catch (error) {
                console.error(error);
                callback("Error: Unable to connect to the chatbot");
            }
        });

        socket.on("disconnect", () => {
            console.log("User disconnected");
        });
    });
    
    server.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

bootstrap();