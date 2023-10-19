import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react"
import { useNavigate } from "react-router-dom";
import { auth } from "../../../lib/firebase";

export const ResetPassword = () => {
    const [email, setEmail] = useState('');
    
    const navigate = useNavigate();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const email = data.get('email')?.toString();

        sendPasswordResetEmail(auth, email ? email : "")
            .then(() => {
                console.log('Password Reset Email Sent!');
                navigate('/login');
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error('Code: ', errorCode, '\nMessage: ', errorMessage);
            })

    };

    return (
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Reset your password</h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <form onSubmit={handleSubmit} action="#" className="space-y-6" method="POST">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900 text-left">Email address</label>
                        <div className="mt-2">
                            <input onChange={(e) => {setEmail(e.target.value)}} value={email} id="email" name="email" type="email" autoComplete="email" required className="block w-full rounded-md border-0 py-1.5 px-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                        </div>
                    </div>
                    <div>
                        <button type="submit" className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Login</button>
                    </div>
                </form>
                <hr className="mt-10"/>

                <p className="mt-10 text-center text-sm text-gray-500">
                    Don't have an account yet?
                    <a onClick={() => navigate("/signup")} className="hover:cursor-pointer font-semibold leading-6 text-indigo-600 hover:text-indigo-500"> Create one here</a>
                </p>
            </div>
        </div>
    )
}