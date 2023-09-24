import { useAlert } from '@/pages/AlertContext';
import axios from 'axios';

const axiosInstance = axios.create();

axiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
    //   console.log("An error occured while fetching the data");
    //   const { addAlert } = useAlert();
    //   addAlert({
    //     type: "error",
    //     title: error.message
    //   })
    //   console.error('Axios error:', error);
  
      throw error;
    }
  );

export default axiosInstance;
