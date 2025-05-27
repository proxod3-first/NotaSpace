import axios, { AxiosRequestConfig } from "axios";

export const axiosBaseQuery =
  ({ baseUrl }: { baseUrl: string } = { baseUrl: "" }): any =>
  async ({ url, method, data, params }: AxiosRequestConfig) => {
    try {
      const result = await axios({
        url: baseUrl + url,
        method,
        data,
        params,
      });
      console.log(result);
      return { data: result.data };
    } catch (axiosError: any) {
      let err = axiosError;
      if (err.response) {
        // Если ошибка на сервере и сервер вернул ошибку в формате { error: 'Error finding notes in db' }
        if (err.response.data?.error) {
          return {
            error: {
              status: err.response.status,
              data: err.response.data.error, // Передаем ошибку как есть
            },
          };
        }
        return {
          error: {
            status: err.response.status,
            data: err.response.data || err.message,
          },
        };
      } else if (err.request) {
        return {
          error: {
            status: "REQUEST_ERROR",
            data: "No response from server",
          },
        };
      } else {
        return {
          error: {
            status: "UNKNOWN_ERROR",
            data: err.message,
          },
        };
      }
    }
  };
