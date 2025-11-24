import axios from "axios";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://127.0.0.1:8000/investments"
    : "https://pesaprime-end.onrender.com/investments";

// ------------ TYPES ------------
export interface Investment {
  id?: number;
  user_id: string;
  title: string;
  amount: number;
  category?: string;
}

// ------------ API FUNCTIONS ------------

export const createInvestment = async (data: Investment) => {
  const res = await axios.post(API_URL + "/", data);
  return res.data;
};

export const getInvestments = async () => {
  const res = await axios.get(API_URL + "/");
  return res.data as Investment[];
};

export const getInvestment = async (id: number) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data as Investment;
};

export const updateInvestment = async (id: number, data: Partial<Investment>) => {
  const res = await axios.put(`${API_URL}/${id}`, data);
  return res.data;
};

export const deleteInvestment = async (id: number) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};
