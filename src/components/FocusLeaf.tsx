import { ReactNode, useEffect, useState, useCallback } from "react";
import { formatStringAsId } from "@/utils/general";
import { FocusContext, useFocusable } from "@noriginmedia/norigin-spatial-navigation";

interface FocusLeafProps { 
    children: ReactNode, 
    className?: string, 
    focusedStyles?: string,
    isForm?: boolean,
    onEnterPress?: () => void,
}

export default function FocusLeaf({ children, className, focusedStyles, isForm, onEnterPress }: FocusLeafProps) {
    const [id, setId] = useState<string>("");

    const handleFocus = useCallback(
        (focused: boolean) => {
            if (isForm && id) {
                const input: HTMLInputElement | null = document.querySelector(`#${id} input`);
                if (input) {
                    focused ? input.focus() : input.blur();
                }
            }
        },
        [isForm, id]
    );

    const { ref, focused, focusKey } = useFocusable({ onFocus: () => handleFocus(true), onBlur: () => handleFocus(false), onEnterPress });

    useEffect(() => {
        setId(formatStringAsId(focusKey));
    }, [focusKey]);

    return (
        <div ref={ref} id={isForm ? id : undefined} className={`${className || ""} ${focused ? focusedStyles : ""}`}>
            {children}
        </div>
    )
}