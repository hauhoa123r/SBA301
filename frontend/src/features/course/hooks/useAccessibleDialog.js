import { useEffect, useRef } from "react";

const FOCUSABLE_ELEMENTS = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
].join(",");

export default function useAccessibleDialog({ open, onClose, dialogRef }) {
    const previouslyFocusedRef = useRef(null);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!open) return undefined;

        previouslyFocusedRef.current = document.activeElement;
        const previousBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const focusDialogFrame = window.requestAnimationFrame(() => {
            dialogRef.current?.focus();
        });

        const handleDialogKeyDown = (event) => {
            const dialog = dialogRef.current;

            if (event.key === "Escape") {
                event.preventDefault();
                onCloseRef.current?.();
                return;
            }

            if (event.key !== "Tab" || !dialog) return;

            const focusableElements = Array.from(dialog.querySelectorAll(FOCUSABLE_ELEMENTS));

            if (focusableElements.length === 0) {
                event.preventDefault();
                dialog.focus();
                return;
            }

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            const activeElement = document.activeElement;

            if (event.shiftKey && (activeElement === firstElement || !dialog.contains(activeElement))) {
                event.preventDefault();
                lastElement.focus();
                return;
            }

            if (!event.shiftKey && (activeElement === lastElement || !dialog.contains(activeElement))) {
                event.preventDefault();
                firstElement.focus();
            }
        };

        document.addEventListener("keydown", handleDialogKeyDown);

        return () => {
            window.cancelAnimationFrame(focusDialogFrame);
            document.removeEventListener("keydown", handleDialogKeyDown);
            document.body.style.overflow = previousBodyOverflow;

            const previouslyFocused = previouslyFocusedRef.current;
            if (previouslyFocused instanceof HTMLElement && document.contains(previouslyFocused)) {
                previouslyFocused.focus();
            }
        };
    }, [dialogRef, open]);
}
