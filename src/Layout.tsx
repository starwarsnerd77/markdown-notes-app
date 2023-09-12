import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import UserContext, { User } from "../context/user";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase"

export const Layout = () => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const cleanup = onAuthStateChanged(auth, (user) => {
            setLoading(false);
            setUser(user as User);
            setLoggedIn(!!user);
        });
        if (!loading) {
            navigate(loggedIn ? "/editor" : "/login");
        }
        return cleanup;
    }, [loggedIn, loading])
    return (
        <UserContext.Provider value={user}>
            {loading ? <div>Loading...</div> : <Outlet />}
        </UserContext.Provider>
    );
}