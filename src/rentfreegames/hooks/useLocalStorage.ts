import { useEffect, useState } from "react";
import { GuestUser } from "../interfaces";

export function useLocalStorage(key: string, fallbackValue: GuestUser) {
    const [value, setValue] = useState(fallbackValue);
    useEffect(() => {
        const stored = localStorage.getItem(key);
        setValue(stored ? JSON.parse(stored) : fallbackValue);
    }, [key, fallbackValue.name]);

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value.name, value.games]);

    return [value, setValue] as const;
}
