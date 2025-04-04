import connectdb from "@/config/Db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server"; 
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        await connectdb();
        const {userId} = getAuth(req);
        if (!userId) {
            return NextResponse.json({
                success: false,
                message: "User not authenticated",
            });
        }
       
        const data = await Chat.find({userId});
        return NextResponse.json({success:true,data})
    } catch (error) {
        return NextResponse.json({success:true,message:error.message})
    }
}