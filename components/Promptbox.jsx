import Image from 'next/image';
import { assets } from '@/assets/assets';
import { useState } from 'react';
import { useAppContext } from '@/context/Appcontext';
import toast from 'react-hot-toast';
import axios from 'axios';

const Promptbox = ({ setisloading, isloading }) => {
  const [prompt, setprompt] = useState('');
  const { user, chats, setchats, selectedchat, setselectedchat } = useAppContext();

  const handlekeydown = async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await sendprompt(e);
    }
  };

  const sendprompt = async (e) => {
    e.preventDefault();
    const promptcopy = prompt.trim();

    if (!user) return toast.error('Login to send a message');
    if (!promptcopy) return toast.error('Enter a message before sending');
    if (isloading) return toast.error('Wait for the previous response');
    if (!selectedchat) return toast.error('Select or create a chat first');

    setisloading(true);
    setprompt('');

    const userprompt = {
      role: 'user',
      content: promptcopy,
      timestamp: Date.now(),
    };

    // Update local UI immediately
    setchats((prevChats) =>
      prevChats.map((chat) =>
        chat._id === selectedchat._id
          ? { ...chat, messages: [...chat.messages, userprompt] }
          : chat
      )
    );

    setselectedchat((prev) => ({
      ...prev,
      messages: [...prev.messages, userprompt],
    }));

    try {
      const { data } = await axios.post('/api/chat/ai', {
        chatId: selectedchat._id,
        prompt: promptcopy,
      });

      if (data.success) {
        const message = data.data.content;
        const messageTokens = message.split(' ');

        const assistantMessage = {
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
        };

        setselectedchat((prev) => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
        }));

        // Token-by-token animated display
        for (let i = 0; i < messageTokens.length; i++) {
          setTimeout(() => {
            assistantMessage.content = messageTokens.slice(0, i + 1).join(' ');
            setselectedchat((prev) => {
              const updatedMessages = [
                ...prev.messages.slice(0, -1),
                assistantMessage,
              ];
              return { ...prev, messages: updatedMessages };
            });
          }, i * 100);
        }

        // Also update global chats
        setchats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === selectedchat._id
              ? { ...chat, messages: [...chat.messages, data.data] }
              : chat
          )
        );
      } else {
        toast.error(data.message);
        setprompt(promptcopy);
      }
    } catch (error) {
      toast.error('Failed to send message');
      setprompt(promptcopy);
    } finally {
      setisloading(false);
    }
  };

  return (
    <form
      onSubmit={sendprompt}
      className={`w-full max-w-2xl bg-[#404045] p-4 rounded-3xl mt-4 transition-all ${
        selectedchat && selectedchat.messages.length > 0 ? 'mb-6' : ''
      }`}
    >
      <textarea
        className="outline-none w-full resize-none overflow-hidden break-words bg-transparent"
        rows={2}
        placeholder="Message DeepSeek"
        required
        onChange={(e) => setprompt(e.target.value)}
        value={prompt}
        onKeyDown={handlekeydown}
      />
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition">
            <Image src={assets.deepthink_icon} alt="" className="h-5" />
            DeepThink (R1)
          </p>
          <p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition">
            <Image src={assets.search_icon} alt="" className="h-5" />
            Search
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Image src={assets.pin_icon} alt="" className="w-4 cursor-pointer" />
          <button
            type="submit"
            className={`${
              prompt ? 'bg-primary' : 'bg-[#71717a]'
            } rounded-full p-2 cursor-pointer`}
          >
            <Image
              src={prompt ? assets.arrow_icon : assets.arrow_icon_dull}
              alt=""
              className="w-3.5 aspect-square"
            />
          </button>
        </div>
      </div>
    </form>
  );
};

export default Promptbox;
