import { Webhook } from "svix";
import connectdb from "@/config/Db.js";
import User from "@/models/User.js";
import { headers } from "next/headers";
import { NextResponse } from "next/server";  

export async function POST(req) {
    const wh = new Webhook(process.env.SIGNING_SECRET);

    const headerPayload = await headers();
    const svixHeaders = {
        "svix-id": headerPayload.get("svix-id"),
        "svix-signature": headerPayload.get("svix-signature"),
        "svix-timestamp": headerPayload.get("svix-timestamp"),
    };

    const payload = await req.json();
    const body = JSON.stringify(payload);
    const { data, type } = wh.verify(body, svixHeaders);

    const userData = {
        _id: data.id,
        email: data.email_addresses[0].email_address,
        name: `${data.first_name} ${data.last_name}`,
        image: data.image_url || "",
    };

    await connectdb();

    try {
        switch (type) {
            case `user.created`:
                
                const existingUser = await User.findOne({ email: userData.email });
                if (!existingUser) {
                    await User.create(userData);
                }
                break;

            case `user.updated`:
                await User.findOneAndUpdate({ email: userData.email }, userData, { new: true });
                break;

            case `user.deleted`:
                await User.findOneAndDelete({ email: userData.email });
                break;

            default:
                break;
        }

        return NextResponse.json({ message: "Event Received" });

    } catch (error) {
        console.error("Error handling webhook:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
