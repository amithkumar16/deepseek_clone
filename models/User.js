import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true }, 
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        image: { type: String },
    },
    { timestamps: true }
);

// Ensure Mongoose does not recompile the model if it's already created
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
