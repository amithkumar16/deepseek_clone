import connectdb from "@/config/Db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(req) {
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
        const { chatId } = await req.json();

        // Find and delete the chat
        const deletedChat = await Chat.findOneAndDelete({ _id: chatId, userId });

        if (!deletedChat) {
            return NextResponse.json({
                success: false,
                message: "Chat not found or you don't have permission to delete it.",
            });
        }

        return NextResponse.json({
            success: true,
            message: "Chat deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting chat:", error);
        return NextResponse.json({
            success: false,
            message: error.message,
        });
    }
}
