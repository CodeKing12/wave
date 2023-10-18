import { memo, useState, useEffect } from "react";
import { CloseCircle, Login as LoginIcon } from "iconsax-react";
import { AUTH_ENDPOINT, PATH_LOGIN, PATH_SALT, authAxiosConfig } from "./constants";
import { sha1 } from "@/utils/Sha";
import { md5crypt } from "@/utils/MD5";
import { parseXml } from "@/pages";
import { PacmanLoader } from "react-spinners";
import { FocusContext, useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import FocusLeaf from "./FocusLeaf";
import axiosInstance from "@/utils/axiosInstance";
import { useAlert } from "@/pages/AlertContext";

interface LoginProps {
    show: boolean;
    onLogin: (authenticated: boolean, token: string) => void;
    onClose: () => void;
}


const Login = memo(function Login({ show, onLogin, onClose }: LoginProps) {
    // console.log("Login is Re-rendering")

    useEffect(() => {
        function handleLoginEscape(event: KeyboardEvent) {
            if (event.code === "Escape" || event.keyCode === 27) {
                onClose();
            }
        }

        document.addEventListener("keydown", handleLoginEscape)

        return () => {
            document.removeEventListener("keydown", handleLoginEscape)
        }
    }, [onClose])

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const {
        ref,
        focusSelf,
        hasFocusedChild,
        focusKey,
    } = useFocusable({
        trackChildren: true,
        autoRestoreFocus: true,
    });
    const { addAlert } = useAlert();

    useEffect(() => {
        // console.log(show)
        if (show) {
            focusSelf();
        }
    }, [focusSelf, show]);

    function loginWebshare(event?: any) {
        if (event) {
            event.preventDefault();
        }
        setIsAuthenticating(true);

        let salt = "";
        let token = "";
        axiosInstance.post(AUTH_ENDPOINT + PATH_SALT,
        {
            username_or_email: username
        }, authAxiosConfig)
        .then(
            function (response) {
                salt = parseXml(response.data, "salt")
                const hashedPassword = sha1(md5crypt(password, salt));
                axiosInstance.post(AUTH_ENDPOINT + PATH_LOGIN, {
                    username_or_email: username,
                    keep_logged_in: 1,
                    password: hashedPassword
                }, authAxiosConfig)
                .then(
                    function (response) {
                        token = parseXml(response.data, "token");
                        
                        if (token && token.length) {
                            const expirationDate = new Date();
                            // Set the token to expire after 3 days
                            expirationDate.setDate(expirationDate.getDate() + 3);
                            
                            const tokenData = {
                                value: token,
                                expiration: expirationDate.getTime()
                                // expiration: new Date().getTime() + 3 * 60 * 1000 // This sets it to expire after 3 mins (for testing purposes)
                            }
                            localStorage.setItem("authToken", JSON.stringify(tokenData));
                            onLogin(true, token);
                        } else {
                            const message = parseXml(response.data, "message")
                            addAlert({
                                type: "error",
                                title: message.endsWith(".") ? message.slice(0, -1) : message
                            })
                        }
                        setIsAuthenticating(false);
                    }
                )
            }
        )
        .catch(
            function () {
                addAlert({
                    type: "error",
                    title: "Login Unsuccessful",
                    message: "Check your network"
                })
                setIsAuthenticating(false);
            }
        )
    }

    return (
        <FocusContext.Provider value={focusKey}>
            <div className={`login-modal fixed w-full h-full top-0 bottom-0 flex justify-center items-center backdrop-blur-lg opacity-0 invisible z-0 duration-300 ease-linear ${show ? "!opacity-100 !visible !z-[110]" : ""}`} ref={ref}>
                <div className={`bg-[#191919] text-white px-8 pt-7 pb-10 w-[450px] rounded-2xl opacity-0 invisible translate-y-10 duration-[400ms] ease-in-out ${show ? "!opacity-100 !visible !translate-y-0" : ""}`}>
                    <div className="flex justify-end mb-10">
                        <FocusLeaf focusedStyles="on-svg-focus" onEnterPress={onClose}>
                            <button className="cursor-pointer text-white hover:text-yellow-300" onClick={onClose}>
                                <CloseCircle className="duration-300 ease-in-out" size={35} />
                            </button>
                        </FocusLeaf>
                    </div>
                    <div className="relative">
                        <div className={`duration-300 ease-in-out ${show ? "opacity-100 visible" : ""} ${isAuthenticating ? "!invisible !opacity-0 !-translate-y-10" : ""}`}>
                            <h3 className="text-3xl font-semibold mb-2 text-gray-50">Log in to Webshare</h3>
                            <p className="text-gray-400 text-sm mb-10">Enter your Webshare username and password</p>
                            <form className="flex flex-col gap-4 w-full mb-4" onSubmit={loginWebshare}>
                                <FocusLeaf isForm className="w-full" focusedStyles="login-input-focus">
                                    <input className="w-full py-3 px-2 text-[15px] !outline-none rounded-md bg-transparent border border-gray-300 border-opacity-40 focus:border-yellow-300 text-gray-300 placeholder:text-gray-400 placeholder:text-opacity-50" type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
                                </FocusLeaf>

                                <FocusLeaf isForm className="w-full" focusedStyles="login-input-focus">
                                    <input className="w-full py-3 px-2 text-[15px] !outline-none rounded-md bg-transparent border border-gray-300 border-opacity-40 focus:border-yellow-300 text-gray-300 placeholder:text-gray-400 placeholder:text-opacity-50" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                                </FocusLeaf>

                                <FocusLeaf focusedStyles="login-button-focus" onEnterPress={loginWebshare}>
                                    <button className="mt-5 px-10 py-5 bg-yellow-300 text-black-1 rounded-xl text-base tracking-wide font-semibold border-2 border-transparent hover:bg-black-1 hover:border-yellow-300 hover:text-yellow-300 flex justify-center items-center gap-2" onClick={loginWebshare} onSubmit={loginWebshare}>
                                        Authenticate
                                        <LoginIcon size={24} variant="Bold" />
                                    </button>
                                </FocusLeaf>
                            </form>
                        </div>
                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-10 invisible opacity-0 duration-300 ease-in-out ${isAuthenticating ? "!visible !opacity-100 -!translate-y-0 !-translate-y-1/2" : ""}`}>
                            <PacmanLoader size={30} color="#fde047" />
                        </div>
                    </div>
                </div>
            </div>
        </FocusContext.Provider>
    )
})

export default Login