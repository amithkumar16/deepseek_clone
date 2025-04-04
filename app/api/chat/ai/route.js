// Please install OpenAI SDK first: `npm install openai`
import OpenAI from "openai";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Chat from "@/models/Chat";
import connectdb from "@/config/Db";

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',  // Fixed base URL
    apiKey: process.env.DEEPSEEK_API_KEY
});

export async function POST(req) {
    try {
        // Authenticate user
        const { userId } = getAuth(req);
        const { chatId, prompt } = await req.json();  // Ensure prompt is extracted
        if (!userId) {
            return NextResponse.json({
                success: false,
                message: "User not authenticated",
            });
        }

        // Parse request body

        // Connect to DB
        await connectdb();

        // Find chat
        const data = await Chat.findOne({ userId, _id: chatId });
      
        // User message object
        const userprompt = {
            role: "user",
            content: prompt,
            timestamp: Date.now()
        };
        data.messages.push(userprompt);

        // Call DeepSeek API
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "deepseek-chat",
        });

        // Extract assistant message
        const message = completion.choices[0].message;
        message.timestamp = Date.now();
        data.messages.push(message);

        // Save chat
        await data.save();  // Fixed missing await

        return NextResponse.json({
            success: true,
            data: message
        });

    } catch (error) {
        console.error("Error processing chat:", error);
        return NextResponse.json({
            success: false,
            message: error.message
        });
    }
}
