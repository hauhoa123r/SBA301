import { useState } from "react";
import "./userMotion.css";

export default function UserImage({
    className = "",
    decoding = "async",
    fetchPriority,
    loading,
    onError,
    onLoad,
    priority = false,
    ...props
}) {
    const [isLoaded, setIsLoaded] = useState(false);

    const handleLoad = (event) => {
        setIsLoaded(true);
        onLoad?.(event);
    };

    const handleError = (event) => {
        setIsLoaded(true);
        onError?.(event);
    };

    return (
        <img
            className={`user-image-fade ${isLoaded ? "user-image-fade--loaded" : ""} ${className}`.trim()}
            decoding={decoding}
            fetchPriority={fetchPriority ?? (priority ? "high" : "auto")}
            loading={loading ?? (priority ? "eager" : "lazy")}
            onError={handleError}
            onLoad={handleLoad}
            {...props}
        />
    );
}
