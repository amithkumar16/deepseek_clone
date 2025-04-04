import connectdb from "@/config/Db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server"; 
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        // Connect to MongoDB
        await connectdb();

        // Get user authentication from Clerk
        const { userId } = getAuth(req);
        if (!userId) {
            return NextResponse.json({
                success: false,
                message: "User not authenticated",
            });
        }

        // Parse request body
        const { chatId, name } = await req.json();

        // Find and update the chat
        const updatedChat = await Chat.findOneAndUpdate(
            { _id: chatId, userId },
            { name },
            { new: true } // Return updated document
        );

        if (!updatedChat) {
            return NextResponse.json({
                success: false,
                message: "Chat not found or you don't have permission to rename it.",
            });
        }

        return NextResponse.json({
            success: true,
            message: "Chat renamed successfully",
            chat: updatedChat, // Optionally return the updated chat
        });
    } catch (error) {
        console.error("Error renaming chat:", error);
        return NextResponse.json({
            success: false,
            message: error.message,
        });
    }
}
