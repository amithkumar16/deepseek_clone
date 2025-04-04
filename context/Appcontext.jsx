"use client"
import { useAuth, useUser } from "@clerk/nextjs"
import axios from "axios"
import { createContext, useContext, useState, useEffect } from "react"
import toast from "react-hot-toast"

export const AppContext = createContext()
export const useAppContext = () => {
    return useContext(AppContext)
}

export const AppContextProvider = ({ children }) => {
    const { user } = useUser()
    const { getToken } = useAuth()

    const [chats, setchats] = useState([]);
    const [selectedchat, setselectedchat] = useState(null);

    const createnewchat = async () => {
        try {
            if (!user) return null;
            const token = await getToken();
            await axios.post(`/api/chat/create`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchuserchats();  // Fetch chats after creating a new chat
        } catch (error) {
            toast.error(error.message);
        }
    };

    const fetchuserchats = async () => {
        try {
            const token = await getToken();
            const { data } = await axios.get(`/api/chat/get`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                console.log("Chats:", data.data);
                setchats(data.data);

                if (data.data.length === 0) {
                    await createnewchat();
                    return fetchuserchats();  // Re-fetch after creating a chat
                } else {
                    // Sort by `updatedAt` to set the latest chat as `selectedchat`
                    data.data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                    setselectedchat(data.data[0]);
                    console.log("Selected Chat:", data.data[0]);
                }
            } else {
                toast.error(data.message);
            }
        } catch (error) {  // ✅ Fixed: error is now defined
            toast.error(error.message);
        }
    };

    useEffect(() => {
        if (user) {  // ✅ Fixed: Runs only when `user` is available
            fetchuserchats();
        }
    }, [user]);

    const value = {
        user,
        chats,
        setchats,
        selectedchat,
        setselectedchat,
        fetchuserchats,
        createnewchat,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
