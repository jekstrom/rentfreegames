import { useEffect, useState } from "react";
import { GuestUser } from "../interfaces";

export function useLocalStorage(key: string, fallbackValue: GuestUser) {
    const [value, setValue] = useState(fallbackValue);
    useEffect(() => {
        console.log("updating guest1", value);
        const stored = localStorage.getItem(key);
        setValue(stored ? JSON.parse(stored) : fallbackValue);
    }, [key, fallbackValue.name]);

    useEffect(() => {
        console.log("updating guest2", value);
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value.name, value.games]);

    return [value, setValue] as const;
}
