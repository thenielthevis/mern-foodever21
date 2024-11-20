// import React, { useEffect, useState, useContext } from "react";

// const AuthContext = React.createContext();

// export const AuthProvider = ({ children }) => {
//     const [token, setToken] = useState(null);
//     const [userData, setUserData] = useState(null);
//     const [isAuthenticated, setIsAuthenticated] = useState(false);

//     useEffect(() => {
//         const storedData = JSON.parse(localStorage.getItem("userData"));
//         if (storedData) {
//             const { userToken, user } = storedData;
//             setToken(userToken);
//             setUserData(user);
//             setIsAuthenticated(true);
//         }
//     }, []);

//     const login = (newToken, newData) => {
//         localStorage.setItem("userData", JSON.stringify({ userToken: newToken, user: newData }));
//         setToken(newToken);
//         setUserData(newData);
//         setIsAuthenticated(true);
//     };

//     const logout = () => {
//         localStorage.removeItem("userData");
//         setToken(null);
//         setUserData(null);
//         setIsAuthenticated(false);
//     };

//     return (
//         <AuthContext.Provider value={{ token, userData, isAuthenticated, login, logout }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = () => useContext(AuthContext);
// export { AuthContext };
// context/AuthContext.js
import React, { createContext, useState, useContext } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    const login = (token, user) => {
        setToken(token);
        setUser(user);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);