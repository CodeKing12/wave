import { ReactNode, useEffect, useState, useCallback } from "react";
import { formatStringAsId } from "@/utils/general";
import { FocusableComponentLayout, useFocusable } from "@noriginmedia/norigin-spatial-navigation";

interface FocusLeafProps { 
    children: ReactNode, 
    className?: string, 
    focusedStyles?: string,
    isForm?: boolean,
    isFocusable?: boolean,
    customFocusKey?: string,
    onFocus?: (layout: FocusableComponentLayout) => void;
    onEnterPress?: () => void,
}

export default function FocusLeaf({ children, className, focusedStyles, customFocusKey, isForm, isFocusable, onFocus, onEnterPress }: FocusLeafProps) {
    const [id, setId] = useState<string>("");

    const handleFocus = useCallback(
        (focused: boolean, focusDetails?: FocusableComponentLayout) => {
            if (isForm && id) {
                const input: HTMLInputElement | null = document.querySelector(`#${id} input`);
                if (input) {
                    focused ? input.focus() : input.blur();
                }
            }
            if (focused && onFocus && focusDetails) {
                onFocus(focusDetails);
            }
        },
        [isForm, id, onFocus]
    );

    const { ref, focused, focusKey } = useFocusable({ 
        onFocus: (focusDetails: FocusableComponentLayout) => handleFocus(true, focusDetails), 
        onBlur: () => handleFocus(false), onEnterPress,
        focusable: isFocusable,
        focusKey: customFocusKey ? customFocusKey : undefined
    });

    useEffect(() => {
        setId(formatStringAsId(focusKey));
    }, [focusKey]);

    return (
        <div ref={ref} id={isForm ? id : undefined} className={`${className || ""} ${focused ? focusedStyles : ""}`}>
            {children}
        </div>
    )
}