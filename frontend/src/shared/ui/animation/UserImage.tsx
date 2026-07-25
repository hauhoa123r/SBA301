import {
  useState,
  type ImgHTMLAttributes,
  type ReactEventHandler,
} from "react";

import "./userMotion.css";

export interface UserImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  priority?: boolean;
}

export const UserImage = ({
  className = "",
  decoding = "async",
  fetchPriority,
  loading,
  onError,
  onLoad,
  priority = false,
  ...props
}: UserImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad: ReactEventHandler<HTMLImageElement> = (event) => {
    setIsLoaded(true);
    onLoad?.(event);
  };

  const handleError: ReactEventHandler<HTMLImageElement> = (event) => {
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
};

export default UserImage;
