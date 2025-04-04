import connectdb from "@/config/Db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server"; 
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
       
        const { userId } = getAuth(req);
        if (!userId) {
            return NextResponse.json({
                success: false,
                message: "User not authenticated",
            });
        }

        // Prepare chat data
        const chatData = {
            userId,
            messages: [],
            name: "New Chat",
        };

        // Connect to MongoDB and create chat
        await connectdb();
        const newChat = await Chat.create(chatData);

        return NextResponse.json({
            success: true,
            message: "Chat created successfully",
            chat: newChat, // Returning created chat data for debugging
        });
    } catch (error) {
        console.error("Error creating chat:", error);
        return NextResponse.json({
            success: false,
            message: error.message,
        });
    }
}
