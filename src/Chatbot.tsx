import React, { useEffect, useRef, useState, FormEvent, ChangeEvent } from 'react';

const Chatbot: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([{ text: "Hello, how can I assist you today?", sender: "chatbot" }]);
  const [isBotReplying, setIsBotReplying] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState({
    fontSize: "text-lg",
    fontColor: "#ff992c",
    fontStyle: "font-sans",
    name: "",
    desc: "",
    headerAlign: "justify-center",
    bgColor: "#fff",
    innerButtonColor: "",
    outerButtonColor: "",
    userChatBg: "",
    botChatBg: "",
    imgUrl: 'https://static.vecteezy.com/system/resources/previews/008/296/267/non_2x/colorful-swirl-logo-design-concept-illustration-vector.jpg',
    logoPosition: 'bottom-left',
    logoBottomPosition: '16'
  });


  const urlParams = new URLSearchParams(window.location.search);
  const userID: any = urlParams.get('userId');
  const apiKey: any = urlParams.get('apiKey');

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  useEffect(() => {
    setLoading(true);
    if (userID && apiKey) {
      const fetchChatHistory = async () => {
        try {
          const response = await fetch(
            `https://sr.adrig.co.in/chatlaps/chathistory?userid=${userID}&chatbotid=${apiKey}`
          );
          const data = await response.json();
          if (data.data !== null) {
            const convertedData = data.data.flatMap((item: { data: { user: string; bot: string; }; }) => [
              { sender: 'user', text: item.data.user.trim() },
              { sender: 'chatbot', text: item.data.bot.trim() }
            ]);
            setMessages([...messages, ...convertedData]);
          }
          if (data.details) {
            setTheme(data.details);
          }
        } catch (error) {
          console.error("Error fetching chat history:", error);
        }
      };

      fetchChatHistory();
    }
    setLoading(false);
  }, []);

  const handleMessageChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    setMessage(event.target.value);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (message.trim() === '') return;

    const newMessage = { sender: 'user', text: message };
    setMessages((prev) => [...prev, newMessage]);
    setMessage('');
    setIsBotReplying(true);

    try {
      const response = await fetch(
        "https://sr.adrig.co.in/chatlaps/chatresponse",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: message,
            userid: userID,
            chatbotid: apiKey,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "chatbot", text: data.data },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { sender: 'chatbot', text: 'Sorry, something went wrong. Please try again later.' },
      ]);
    } finally {
      setIsBotReplying(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.closest('form');
      if (form) {
        form.requestSubmit();
      }
    }
  };

  return (
    <>
      {loading ?
        <div className="flex justify-center items-center h-screen">
          <div className="relative flex flex-col space-y-2">
            <div className="absolute rounded-full h-8 w-8 bg-gray-800 animate-ping animation-delay-200"></div>
            <div className="absolute left-1 -top-1 rounded-full h-6 w-6 bg-gray-800 animate-ping animation-delay-400"></div>
            <div className="absolute left-2 -top-0 rounded-full h-4 w-4 bg-gray-800 animate-ping animation-delay-600"></div>
          </div>
        </div>

        :
        <main
          className="group relative flex h-screen flex-col bg-white data-[theme=dark]:bg-black"
          data-theme="light"
        >
          <header
            className="relative flex items-center justify-between px-5 text-zinc-50"
            style={{
              background:
                'linear-gradient(0deg, rgba(255, 255, 255, 0) 29.14%, rgba(20, 15, 15, 0.16) 100%),#000000',
            }}
          >
            <div className="my-4 flex h-10 items-center">
              <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full mr-2 size-10 border-white/[0.08] group-data-[theme=dark]:border">
                <img
                  src={theme.imgUrl}
                  alt="Chatbase AI Avatar"
                />
              </span>
              <div className="flex flex-col justify-center gap-px">
                <h1 className="font-semibold text-sm">Chatbase AI</h1>
              </div>
            </div>
          </header>
          <div className="relative flex flex-1 basis-full flex-col overflow-y-hidden shadow-inner">
            <div ref={chatContainerRef} className="flex w-full flex-1 flex-col space-y-5 overflow-y-auto px-5 pt-5 pb-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex w-full items-end pr-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                >
                  {msg.sender === 'chatbot' && (
                    <span className="relative flex shrink-0 overflow-hidden rounded-full mr-2 h-8 w-8 border-zinc-800 group-data-[theme=dark]:border">
                      <svg
                        stroke="none"
                        fill="black"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                        height="30"
                        width="30"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                        ></path>
                      </svg>
                    </span>
                  )}
                  <div className="group/message flex max-w-[65ch] flex-col items-start">
                    <div className="relative flex w-fit max-w-full flex-col items-baseline gap-2">
                      <div className="max-w-full overflow-hidden">
                        <div
                          style={{
                            borderRadius: msg.sender === 'user' ? '20px 20px 5px 20px' : '20px 20px 20px 5px',
                          }}
                          className={`hyphens-auto break-words  text-left text-sm leading-5 antialiased px-5 py-4 bg-zinc-200/50 text-zinc-800 group-data-[theme=dark]:bg-zinc-800/80 group-data-[theme=dark]:text-zinc-300 ${msg.sender === 'user'
                            ? 'bg-blue-500 text-white self-end rounded-t-[20px] rounded-r-[20px]'
                            : 'self-start'
                            }`}
                        >
                          <p>{msg.text}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isBotReplying && (

                <div
                  className={`flex w-full items-end pr-3 justify-start `}
                >
                  <span className="relative flex shrink-0 overflow-hidden rounded-full mr-2 h-8 w-8 border-zinc-800 group-data-[theme=dark]:border">
                    <svg
                      stroke="none"
                      fill="black"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      height="30"
                      width="30"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                      ></path>
                    </svg>
                  </span>
                  <div className="group/message flex max-w-[65ch] flex-col items-start">
                    <div className="relative flex w-fit max-w-full flex-col items-baseline gap-2">
                      <div className="max-w-full overflow-hidden">
                        <div
                          style={{ borderRadius: '20px 20px 20px 5px' }}
                          className={`hyphens-auto break-words rounded-[20px] text-left text-sm leading-5 antialiased px-5 py-4 bg-zinc-200/50 text-zinc-800 group-data-[theme=dark]:bg-zinc-800/80 group-data-[theme=dark]:text-zinc-300 self-start`}
                        >
                          <div className="flex justify-center items-center">
                            <div className="flex space-x-2">
                              <div className="h-2 w-2 bg-black rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                              <div className="h-2 w-2 bg-black rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                              <div className="h-2 w-2 bg-black rounded-full animate-bounce"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              )}
            </div>
          </div>
          <div className="flex shrink-0 flex-col justify-end">
            <div className="flex min-h-16 items-end border-zinc-200 border-t group-data-[theme=dark]:border-zinc-800">
              <form onSubmit={handleSubmit} className="w-full flex">
                <textarea
                  className="flex w-full border-zinc-200 bg-white text-sm ring-offset-white dark:border-zinc-800  dark:placeholder:text-zinc-400 placeholder:text-zinc-500 focus-visible:outline-none dark:focus-visible:ring-zinc-300 focus-visible:ring-violet-500 dark:ring-offset-zinc-950 my-auto max-h-40 min-h-8 resize-none rounded-none border-0 placeholder-zinc-400 flex-1 p-3 group-data-[theme=dark]:bg-black group-data-[theme=dark]:text-white"
                  id="message"
                  name="message"
                  value={message}
                  onChange={handleMessageChange}
                  onKeyDown={handleKeyDown}
                  maxLength={8000}
                  rows={1}
                  placeholder="Message..."
                  style={{ height: '44px' }}
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center text-sm font-medium text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 hover:bg-zinc-100/90 h-9 w-9 my-3 mr-2 size-5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                    <path d="M10 14L12.2728 19.3032C12.5856 20.0331 13.5586 20.1103 13.9486 19.4185C14.7183 18.0535 15.8591 15.8522 17 13C19 8 20 4 20 4M10 14L4.69678 11.7272C3.96687 11.4144 3.88975 10.4414 4.58149 10.0514C5.94647 9.28173 8.14784 8.14086 11 7C16 5 20 4 20 4M10 14L20 4" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
          <footer className="flex min-h-10 w-full max-w-full shrink-0 items-center justify-center text-xs text-zinc-500 group-data-[theme=dark]:bg-zinc-900/90">
            <p style={{ textAlign: 'center' }}>
              By continuing, you agree to our{' '}
              <a
                target="_blank"
                rel="noopener noreferrer nofollow"
                href="http://arivubot.tipflow.pro/legal/privacy"
              >
                <u>privacy policy</u>
              </a>.
            </p>
          </footer>
        </main>
      }
    </>
  );
};

export default Chatbot;
