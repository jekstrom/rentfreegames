import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { GuestUser } from '../interfaces';

const GuestUserContext = React.createContext<GuestUser>({ id: "", sub: "", isGuest: true, name: '', games: [], gameRatings: [] });
const SetGuestUserContext = React.createContext<React.Dispatch<React.SetStateAction<GuestUser>>>(() => {});

export function useGuestUserContext() {
    return React.useContext(GuestUserContext);
}

export function useSetGuestUserContext() {
    return React.useContext(SetGuestUserContext);
}

export function useGuestUser() {
    return useLocalStorage("guestUser", { id: "", sub: "", isGuest: true, name: '', games: [], gameRatings: [] });
}

const GuestUserProvider = (props: any) => {
    const [value, setValue] = useGuestUser();
  return (
    <GuestUserContext.Provider value={value}>
        <SetGuestUserContext.Provider value={setValue}>
            {props.children}
        </SetGuestUserContext.Provider>
    </GuestUserContext.Provider>
  );
}

export { GuestUserContext, GuestUserProvider };