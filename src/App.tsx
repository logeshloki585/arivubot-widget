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
    innerButtonColor: "",
    outerButtonColor: "",
    userChatBg: "",
    botChatBg: "",
    imgUrl: '',
    logoPosition: 'bottom-left',
    logoBottomPosition: '16'
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
    const userID: string = '1234';
    const apiKey: string = '315fc257-a083-44ce-805b-28aa36f55c1e';
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
    <div className="arivu-ml-4">
      {!loading && (
        <>
          {show && (
            <div className="arivu-relative ">
              <div
                className={`arivu-fixed   arivu-w-[350px] lg:arivu-w-[500px] xl:arivu-w-[33vw] arivu-h-[80vh]  lg:arivu-h-[80vh] xl:arivu-h-[85vh] arivu-bg-white arivu-bg-[${theme.bgColor
                  }] arivu-p-4 arivu-rounded-lg arivu-border arivu-border-[#e5e7eb] arivu-shadow-2xl arivu-transform arivu-transition-all arivu-duration-500 arivu-ease-in-out ${show
                    ? "arivu-opacity-100 arivu-translate-y-0"
                    : "arivu-opacity-0 arivu-translate-y-[100%]"
                  }`}
                style={{ backgroundColor: theme.bgColor, [theme.logoPosition === 'bottom-left' ? 'arivu-left' : 'arivu-right']: '16px', bottom: `${parseInt(theme.logoBottomPosition) + 72}px` }}
              >
                <div
                  className={`arivu-flex arivu-flex-col ${theme.headerAlign} arivu-items-center arivu-space-y-1.5 arivu-pb-4`}
                >
                  <h2
                    className={`arivu-font-bold`}
                    style={{
                      fontSize: theme.fontSize,
                      color: theme.fontColor,
                    }}
                  >
                    {theme.name}
                  </h2>
                  {theme.desc && theme.desc !== "" && (
                    <p className="arivu-text-sm arivu-text-[#6b7280]">{theme.desc}</p>
                  )}
                </div>
                <div
                  ref={chatContainerRef}
                  className="arivu-overflow-y-auto arivu-flex-1 arivu-mb-12 "
                  style={{ maxHeight: "calc(80vh - 150px)" }}
                >
                  {messages.map((message, index) => (
                    <div
                      className={`arivu-flex arivu-flex-col arivu-gap-3 arivu-my-4 arivu-text-sm ${message.user ? "arivu-justify-end" : "arivu-justify-start"
                        }`}
                      key={index}
                    >
                      {message.user && (
                        <div className="arivu-flex arivu-justify-end arivu-pr-4">
                          <p
                            className={`arivu-leading-relaxed arivu-max-w-[80%]  arivu-text-right arivu-bg-[${theme.userChatBg}] arivu-text-black arivu-rounded-lg arivu-p-3`}
                            style={{ backgroundColor: theme.userChatBg }}
                          >
                            {message.user}
                          </p>
                        </div>
                      )}
                      {(message.bot || isBotReplying) && (
                        <div className="arivu-flex arivu-justify-start arivu-gap-2">
                          <span className="arivu-relative arivu-flex arivu-shrink-0 arivu-overflow-hidden arivu-rounded-full arivu-w-8 arivu-h-8">
                            <div className="arivu-rounded-full arivu-bg-gray-100 arivu-border arivu-p-1">
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
                            className={`arivu-leading-relaxed arivu-max-w-[80%] arivu-text-left arivu-bg-[${theme.botChatBg}] arivu-text-black arivu-rounded-lg arivu-p-3`}
                            style={{ backgroundColor: theme.botChatBg }}
                          >
                            {isBotReplying && message.bot === "" ? (
                              <div className="arivu-flex arivu-space-x-1 arivu-justify-center arivu-items-center">
                                <div className="arivu-h-2 arivu-w-2 arivu-bg-black arivu-rounded-full arivu-animate-bounce [arivu-animation-delay:-0.3s]"></div>
                                <div className="arivu-h-2 arivu-w-2 arivu-bg-black arivu-rounded-full arivu-animate-bounce [arivu-animation-delay:-0.15s]"></div>
                                <div className="arivu-h-2 arivu-w-2 arivu-bg-black arivu-rounded-full arivu-animate-bounce"></div>
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
                <div className="arivu-absolute arivu-bottom-4 arivu-left-4 arivu-right-4 arivu-bg-white arivu-pt-2">
                  <form
                    className="arivu-flex arivu-items-center arivu-space-x-2"
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
                      className="arivu-flex arivu-h-10 arivu-w-full arivu-rounded-md arivu-px-3 arivu-text-sm arivu-border-2 arivu-placeholder-[#6b7280] arivu-focus:outline-none arivu-text-[#030712]"
                      placeholder="Enter your message..."
                    />
                    <button
                      className={`arivu-inline-flex arivu-items-center arivu-justify-center arivu-rounded-full arivu-text-sm arivu-font-medium arivu-text-[#f9fafb] arivu-hover:bg-[#111827E6] arivu-h-12 arivu-w-14 arivu-pl-1`}
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
              className={`arivu-fixed arivu-transform arivu-transition-all arivu-ease-out arivu-duration-500 ${notification ? "arivu-translate-x-0 " : "arivu-translate-x-full"
                } arivu-flex arivu-items-center arivu-max-w-[340px] md:arivu-max-w-xl arivu-mx-auto arivu-p-6 arivu-rounded-lg arivu-bg-white arivu-shadow-lg`}
              style={{ [theme.logoPosition === 'bottom-left' ? 'arivu-left' : 'arivu-right']: '16px', bottom: `${parseInt(theme.logoBottomPosition) + 72}px` }}
            >
              <div className="arivu-relative">
                <div className="arivu-chat-notification-content arivu-ml-2 arivu-pr-6">
                  <p className="arivu-chat-notification-message arivu-text-gray-600 arivu-text-base arivu-arivu-leading-relaxed">
                    {notification}
                  </p>
                </div>
                <button
                  className="arivu-absolute arivu-top-2 arivu-right-0 arivu-text-gray-500 hover:arivu-text-gray-700"
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
            className={`arivu-fixed  arivu-inline-flex arivu-items-center arivu-justify-center arivu-text-sm arivu-font-medium disabled:arivu-pointer-events-none arivu-bg-[${theme.outerButtonColor}] disabled:arivu-opacity-50  arivu-rounded-full arivu-w-16 arivu-h-16  arivu-m-0 arivu-cursor-pointer arivu-p-0 arivu-normal-case arivu-leading-5 hover:arivu-text-gray-900 arivu-transition-all arivu-duration-300`}
            type="button"

            style={{ backgroundColor: theme.outerButtonColor, [theme.logoPosition === 'bottom-left' ? 'arivu-left' : 'arivu-right']: '16px', bottom: `${parseInt(theme.logoBottomPosition)}px` }}
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

              <>
                {(theme?.imgUrl && theme.imgUrl !== '') ?
                  <div className="p-3.5">
                    <img className="" src={theme.imgUrl} />
                  </div> :
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="#fff"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white block border-gray-200 align-middle"
                  >
                    <path
                      d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"
                      className="border-gray-200"
                    ></path>
                  </svg>
                }
              </>

            )}
          </button>
        </>
      )}
    </div>
  );
}

export default App;
