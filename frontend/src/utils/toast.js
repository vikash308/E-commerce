import { toast } from 'react-toastify';

export const showToast = (type, message) => {
  const options = {
    position: "bottom-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  if (type === 'success') {
    toast.success(message, options);
  } else if (type === 'error') {
    toast.error(message, options);
  } else {
    toast.info(message, options);
  }
};

export default showToast;
