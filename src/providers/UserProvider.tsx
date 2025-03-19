import { View, Text } from 'react-native'
import React, { useState } from 'react'
import UserContext from '@/context/UserContext';

type Props = {
    children: React.ReactNode
}

const UserProvider = ({ children }: Props) => {

    const [userDetails, setUserDetails] = useState<IUserDetails | undefined>(undefined);

    return (
        <UserContext.Provider value={{ setUserDetails, userDetails }}>
            {children}
        </UserContext.Provider>
    )
}

export default UserProvider