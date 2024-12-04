import { useState, useEffect, useRef } from "react";

interface ChatMessage {
  bot: string;
  user: string;
}
declare global {
  interface Window {
    userId: string;
    apiKey: string;
  }
}
function App() {
  const [show, setShow] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { bot: "Hello, how can I assist you today?", user: "" },
  ]);
  const [theme, setTheme] = useState({
    fontSize: "text-lg",
    fontColor: "#ff992c",
    fontStyle: "font-sans",
    name: "",
    desc: "",
    headerAlign: "justify-center",
    bgColor: "#fff",
    innerButtonColor: "#ff992c",
    outerButtonColor: "#ff992c",
    userChatBg: "#d1fae5",
    botChatBg: "#f1f0f0",
  });
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [isBotReplying, setIsBotReplying] = useState(false);
  const [notification, setNotification] = useState("");
  const userID = window.userId;
  const apiKey = window.apiKey;

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, show]);

  useEffect(() => {
    // const userID: string = '1234';
    // const apiKey: string = 'aea65f83-62fd-4cc4-8758-eb7d9f50e64c';
    setLoading(true);
    if (userID && apiKey) {
      const fetchChatHistory = async () => {
        try {
          const response = await fetch(
            `https://sr.adrig.co.in/chatlaps/chathistory?userid=${userID}&chatbotid=${apiKey}`
          );
          const data = await response.json();
          if (data.data !== null) {
            console.log(data.data);
            setMessages(data.data);
          }
          if (data.details) {
            setTheme(data.details);
          }
          if (data?.response) {
            setNotification(data.response);
          }
        } catch (error) {
          console.error("Error fetching chat history:", error);
        }
      };

      fetchChatHistory();
    }
    setLoading(false);
  }, []);

  const sendMessage = async (newUserMessage: string) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { bot: "", user: newUserMessage },
    ]);

    if (apiKey === "") {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          bot: "Sorry, something went wrong. Please try again later.",
          user: "",
        },
      ]);
      return;
    }

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
            question: newUserMessage,
            userid: userID || "",
            chatbotid: apiKey,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();

      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1),
        { ...prevMessages[prevMessages.length - 1], bot: data.data },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          bot: "Sorry, something went wrong. Please try again later.",
          user: "",
        },
      ]);
    } finally {
      setIsBotReplying(false);
    }
  };

  const toggleChatVisibility = () => {
    setShow((prev) => !prev);
  };

  return (
    <>
      {!loading && (
        <>
          {show && (
            <div className="relative">
              <div
                className={`fixed bottom-24 right-4 w-[350px] lg:w-[500px] xl:w-[33vw] h-[80vh]  lg:h-[80vh] xl:h-[85vh] bg-white bg-[${
                  theme.bgColor
                }] p-4 rounded-lg border border-[#e5e7eb] shadow-2xl transform transition-all duration-500 ease-in-out ${
                  show
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-[100%]"
                }`}
                style={{ backgroundColor: theme.bgColor }}
              >
                <div
                  className={`flex flex-col ${theme.headerAlign} items-center space-y-1.5 pb-4`}
                >
                  <h2
                    className={`font-bold ${theme.fontSize} text-[${theme.fontColor}]`}
                    style={{
                      fontSize: theme.fontSize,
                      color: theme.fontColor,
                    }}
                  >
                    {theme.name}
                  </h2>
                  {theme.desc && theme.desc !== "" && (
                    <p className="text-sm text-[#6b7280]">{theme.desc}</p>
                  )}
                </div>
                <div
                  ref={chatContainerRef}
                  className="overflow-y-auto flex-1 mb-12 "
                  style={{ maxHeight: "calc(80vh - 150px)" }}
                >
                  {messages.map((message, index) => (
                    <div
                      className={`flex flex-col gap-3 my-4 text-sm ${
                        message.user ? "justify-end" : "justify-start"
                      }`}
                      key={index}
                    >
                      {message.user && (
                        <div className="flex justify-end pr-4">
                          <p
                            className={`leading-relaxed max-w-[80%]  text-right bg-[${theme.userChatBg}] text-black rounded-lg p-3`}
                            style={{ backgroundColor: theme.userChatBg }}
                          >
                            {message.user}
                          </p>
                        </div>
                      )}
                      {(message.bot || isBotReplying) && (
                        <div className="flex justify-start gap-2">
                          <span className="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8">
                            <div className="rounded-full bg-gray-100 border p-1">
                              <svg
                                stroke="none"
                                fill="black"
                                strokeWidth="1.5"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                                height="20"
                                width="20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                                ></path>
                              </svg>
                            </div>
                          </span>
                          <p
                            className={`leading-relaxed max-w-[80%] text-left bg-[${theme.botChatBg}] text-black rounded-lg p-3`}
                            style={{ backgroundColor: theme.botChatBg }}
                          >
                            {isBotReplying && message.bot === "" ? (
                              <div className="flex space-x-1 justify-center items-center">
                                <div className="h-2 w-2 bg-black rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="h-2 w-2 bg-black rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="h-2 w-2 bg-black rounded-full animate-bounce"></div>
                              </div>
                            ) : (
                              message.bot
                            )}
                          </p>
                        </div>
                      )}

                      {/* <p
                    className={`leading-relaxed max-w-[80%] ${message.user ? 'text-right bg-[#d1fae5]' : 'text-left bg-[#f1f0f0]'} text-black rounded-lg p-3`}
                  >
                    {isBotReplying && message.bot === '' ? (
                      <div className="flex space-x-1 justify-center items-center">
                        <div className="h-2 w-2 bg-black rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="h-2 w-2 bg-black rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="h-2 w-2 bg-black rounded-full animate-bounce"></div>
                      </div>
                    ) : (
                      message.bot || message.user
                    )}
                  </p> */}
                    </div>
                  ))}
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-white pt-2">
                  <form
                    className="flex items-center space-x-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const userMessage = (e.target as HTMLFormElement).message
                        .value;
                      if (userMessage.trim()) {
                        sendMessage(userMessage);
                        (e.target as HTMLFormElement).reset();
                      }
                    }}
                  >
                    <input
                      name="message"
                      disabled={isBotReplying}
                      className="flex h-10 w-full rounded-md px-3 text-sm border-2 placeholder-[#6b7280] focus:outline-none text-[#030712]"
                      placeholder="Enter your message..."
                    />
                    <button
                      className={`inline-flex items-center justify-center rounded-full text-sm font-medium text-[#f9fafb] bg-[${theme.innerButtonColor}] hover:bg-[#111827E6] h-12 w-14 pl-1`}
                      type="submit"
                      style={{ backgroundColor: theme.innerButtonColor }}
                      disabled={isBotReplying}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="30px"
                        height="30px"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M11.5003 12H5.41872M5.24634 12.7972L4.24158 15.7986C3.69128 17.4424 3.41613 18.2643 3.61359 18.7704C3.78506 19.21 4.15335 19.5432 4.6078 19.6701C5.13111 19.8161 5.92151 19.4604 7.50231 18.7491L17.6367 14.1886C19.1797 13.4942 19.9512 13.1471 20.1896 12.6648C20.3968 12.2458 20.3968 11.7541 20.1896 11.3351C19.9512 10.8529 19.1797 10.5057 17.6367 9.81135L7.48483 5.24303C5.90879 4.53382 5.12078 4.17921 4.59799 4.32468C4.14397 4.45101 3.77572 4.78336 3.60365 5.22209C3.40551 5.72728 3.67772 6.54741 4.22215 8.18767L5.24829 11.2793C5.34179 11.561 5.38855 11.7019 5.407 11.8459C5.42338 11.9738 5.42321 12.1032 5.40651 12.231C5.38768 12.375 5.34057 12.5157 5.24634 12.7972Z"
                          stroke="#fff"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {notification !== "" && !show && (
            <div
              className={`fixed bottom-24 transform transition-all ease-out duration-500 ${
                notification ? "translate-x-0 right-4" : "translate-x-full"
              } flex items-center max-w-[340px] md:max-w-xl mx-auto p-6 rounded-lg bg-white shadow-lg`}
            >
              <div className="relative">
                <div className="chat-notification-content ml-2 pr-6">
                  <p className="chat-notification-message text-gray-600 text-base leading-relaxed">
                    {notification}
                  </p>
                </div>
                <button
                  className="absolute top-2 right-0 text-gray-500 hover:text-gray-700"
                  onClick={() => setNotification("")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          )}

          <button
            onClick={toggleChatVisibility}
            className={`fixed bottom-4 right-4 inline-flex items-center justify-center text-sm font-medium disabled:pointer-events-none bg-[${theme.outerButtonColor}] disabled:opacity-50  rounded-full w-16 h-16  m-0 cursor-pointer p-0 normal-case leading-5 hover:text-gray-900 transition-all duration-300`}
            type="button"
            style={{ backgroundColor: theme.outerButtonColor }}
          >
            {show ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="34px"
                height="34px"
                viewBox="0 0 24 24"
                fill="#fff"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M4.29289 8.29289C4.68342 7.90237 5.31658 7.90237 5.70711 8.29289L12 14.5858L18.2929 8.29289C18.6834 7.90237 19.3166 7.90237 19.7071 8.29289C20.0976 8.68342 20.0976 9.31658 19.7071 9.70711L12.7071 16.7071C12.3166 17.0976 11.6834 17.0976 11.2929 16.7071L4.29289 9.70711C3.90237 9.31658 3.90237 8.68342 4.29289 8.29289Z"
                  fill="#ffffff"
                />
              </svg>
            ) : (
              // <svg
              //   xmlns="http://www.w3.org/2000/svg"
              //   width="30"
              //   height="40"
              //   viewBox="0 0 24 24"
              //   fill="none"
              //   stroke="currentColor"
              //   strokeWidth="2"
              //   strokeLinecap="round"
              //   strokeLinejoin="round"
              //   className="text-white block border-gray-200 align-middle"
              // >
              //   <path
              //     d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"
              //     className="border-gray-200"
              //   ></path>
              // </svg>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                <path
                  d="M20 80 H35 V70"
                  stroke="#fff"
                  stroke-width="8"
                  fill="none"
                />
                <path
                  d="M80 80 H65 V70"
                  stroke="#fff"
                  stroke-width="8"
                  fill="none"
                />

                <path
                  d="M35 70 
       C25 70, 15 60, 15 45 
       C15 25, 30 15, 50 15
       C70 15, 85 25, 85 45
       C85 60, 75 70, 65 70"
                  stroke="#fff"
                  stroke-width="8"
                  fill="none"
                  stroke-linecap="round"
                />
              </svg>
            )}
          </button>
        </>
      )}
    </>
  );
}

export default App;
