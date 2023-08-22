import axios from "axios";
import { useState } from "react";
import { CloseCircle, Login as LoginIcon } from "iconsax-react";
import { AUTH_ENDPOINT, PATH_LOGIN, PATH_SALT, authAxiosConfig } from "./constants";
import { sha1 } from "@/utils/Sha";
import { md5crypt } from "@/utils/MD5";
import { parseXml } from "@/pages";

interface LoginProps {
    show: boolean;
    onLogin: (authenticated: boolean, token: string) => void;
    onClose: () => void;
}


export default function Login({ show, onLogin, onClose }: LoginProps) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    function loginWebshare(event: any) {
        event.preventDefault();

        let salt = "";
        let token = "";
        axios.post(AUTH_ENDPOINT + PATH_SALT,
        {
            username_or_email: username
        }, authAxiosConfig)
        .then(
            function (response) {
                salt = parseXml(response.data, "salt")
                const hashedPassword = sha1(md5crypt(password, salt));
                axios.post(AUTH_ENDPOINT + PATH_LOGIN, {
                    username_or_email: username,
                    keep_logged_in: 1,
                    password: hashedPassword
                }, authAxiosConfig)
                .then(
                    function (response) {
                        token = parseXml(response.data, "token");
                        localStorage.setItem("authToken", token);
                        onLogin(true, token);
                    }
                )
            }
        )
    }

    return (
        <div className={`fixed w-full h-full top-0 bottom-0 flex justify-center items-center backdrop-blur-lg opacity-0 invisible duration-300 ease-linear ${show ? "!opacity-100 !visible" : ""}`}>
            <div className={`bg-[#191919] text-white px-8 pt-7 pb-10 w-[450px] rounded-2xl opacity-0 invisible translate-y-10 duration-[400ms] ease-in-out ${show ? "!opacity-100 !visible !translate-y-0" : ""}`}>
                <div className="flex justify-end mb-10">
                    <button className="cursor-pointer text-white hover:text-yellow-300" onClick={onClose}>
                        <CloseCircle size={32} />
                    </button>
                </div>
                <h3 className="text-3xl font-semibold mb-2 text-gray-50">Log in to Webshare</h3>
                <p className="text-gray-400 text-sm mb-10">Enter your Webshare username and password</p>
                <form className="flex flex-col gap-4 w-full mb-4">
                    <div className="w-full">
                        <input className="w-full py-3 px-2 text-[15px] !outline-none rounded-md bg-transparent border border-gray-300 border-opacity-40 focus:border-yellow-300 text-gray-300 placeholder:text-gray-400 placeholder:text-opacity-50" type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
                    </div>

                    <div className="w-full">
                        <input className="w-full py-3 px-2 text-[15px] !outline-none rounded-md bg-transparent border border-gray-300 border-opacity-40 focus:border-yellow-300 text-gray-300 placeholder:text-gray-400 placeholder:text-opacity-50" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                    </div>

                    <button className="mt-5 px-4 py-5 bg-yellow-300 text-black-1 rounded-xl text-base tracking-wide font-semibold border-2 border-transparent hover:bg-black-1 hover:border-yellow-300 hover:text-yellow-300 flex justify-center items-center gap-2" onClick={loginWebshare}>
                        Authenticate
                        <LoginIcon size={24} variant="Bold" />
                    </button>
                </form>
            </div>
        </div>
    )
}