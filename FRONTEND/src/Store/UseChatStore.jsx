import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/Axios";
import { useAuthStore } from "./useAuthStore";
export const useChatStore = create((set, get) => ({
  message: [],
  users: [],
  selectedUser: null,
  isUserLoading: false,
  isMessageLoading: false,

  getUsers: async () => {
    set({ isUserLoading: true });
    try {
      const res = await axiosInstance.get("/mess/users"); // Ensure correct route
      // console.log("Response from API / its in checkauth from stor:", res.data); // Ensure the response shows correct user data
      set({ users: res.data });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Something went wrong. Try again."
      );
      set({ users: [] });
    } finally {
      set({ isUserLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessageLoading: true });
    try {
      const res = await axiosInstance.get(`/mess/${userId}`); // Ensure correct route
      // console.log("Response from API / its in checkauth from stor:", res.data); // Ensure the response shows correct user data
      set({ message: res.data });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Something went wrong. Try again."
      );
      set({ message: [] });
    } finally {
      set({ isMessageLoading: false });
    }
  },

  sendMessage: async (data) => {
    const { selectedUser, message } = get();
    try {
      const res = await axiosInstance.post(
        `/mess/send/${selectedUser._id}`,
        data
      );
      set({ message: [...message, res.data] });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Something went wrong. Try again."
      );
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.error("Socket is not connected");
      return;
    }
    socket.on("NewMessage", (data) => {
      if (data.senderId !== selectedUser._id) return;
      set({ message: [...get().message, data] });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.error("Socket is not connected");
      return;
    }
    socket.off("NewMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
