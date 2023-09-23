import React, { useState, useEffect } from "react";
import { TickCircle } from "iconsax-react";

export type AlertType = "success" | "error" | "warning" | "info";

export interface AlertData {
    title: string;
    message?: string;
    type: AlertType;
}

export interface AlertInfo extends AlertData {
    id: number;
}

export interface AlertProps extends AlertInfo {
    onRemove: (id: number) => void;
}

export default function Alert({ id, title, message, type, onRemove }: AlertProps) {
    const [show, setShow] = useState(false);

  useEffect(() => {
    // If show is passed in the moment the component is created, the animation doesn't show
    // So I set show after the component is created.
    setShow(true);
    const timer = setTimeout(() => {
      onRemove(id);
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [id, onRemove]);

  return (
    <div
      className={`flex gap-3 items-center px-4 py-2.5 bg-neutral-900 border-2 border-yellow-300 rounded-[40px] duration-500 ease-in-out -translate-y-[calc(100%+12px)] opacity-0 invisible ${show ? "!opacity-100 !visible !translate-y-0 z-50" : ""}`}
    >
      <div className="p-2 rounded-full bg-black-1 bg-neutral-800">
        <TickCircle size="28px" variant="Bold" className="text-yellow-300" />
      </div>
      <p className="font-medium text-gray-200">{title}</p>
    </div>
  );
}
