// src/context/AuthContext.ts
import { createContext } from 'react';

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export default AuthContext;
