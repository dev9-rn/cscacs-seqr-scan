import React, { useEffect, useState } from 'react'
import AuthContext from '@/context/AuthContext'
import { storage } from '@/utils/storageService';
import { STORAGE_KEYS } from '@/libs/constants';
import useUser from '@/hooks/useUser';

type Props = {
    children: React.ReactNode;
}

const AuthProvider = ({ children }: Props) => {

    const { userDetails, setUserDetails } = useUser();

    const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(false);
    const [authToken, setAuthToken] = useState<string | undefined>("");

    const setLocalUser = () => {
        if (!authToken || !userDetails) return;
        storage.set(STORAGE_KEYS.accessToken, authToken);
        storage.set(STORAGE_KEYS.localUser, JSON.stringify(userDetails));
    }

    const getLocalUser = () => {
        const localUserToken = storage.getString(STORAGE_KEYS.accessToken);
        const localUser = storage.getString(STORAGE_KEYS.localUser);

        if (!localUserToken || !localUser) {
            setIsUserLoggedIn(false)
        } else {
            setIsUserLoggedIn(true);
            setAuthToken(localUserToken);
            setUserDetails(JSON.parse(localUser));
        };
    };

    useEffect(() => {
        setLocalUser();
    }, [authToken]);

    useEffect(() => {
        getLocalUser();
    }, []);

    return (
        <AuthContext.Provider value={{ setIsUserLoggedIn, isUserLoggedIn, setAuthToken, authToken }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider