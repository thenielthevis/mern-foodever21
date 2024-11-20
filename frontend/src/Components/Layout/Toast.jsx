import React from "react";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const Toast = (message, type) => {
  switch (type) {
    case "success":
      return toast.success(<p>{message}</p>, { position: 'bottom-right' });
    case "error":
      return toast.error(<p>{message}</p>, { position: 'bottom-right' });
    case "warning":
      return toast.warning(<p>{message}</p>, { position: 'bottom-right' });
    case "loading":
      return toast.loading(<p>{message}</p>, { position: 'bottom-right' });
    default:
      return toast(<p>Toast not defined...</p>);
  }
};

export default Toast;
