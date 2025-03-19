// src/context/UserContext.ts
import { createContext } from 'react';

const UserContext = createContext<IUserContext | undefined>(undefined);

export default UserContext;
