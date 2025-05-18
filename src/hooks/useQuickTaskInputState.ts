
import { create } from 'zustand';

interface QuickTaskInputState {
  inputValue: string;
  setInputValue: (value: string) => void;
}

export const useQuickTaskInputState = create<QuickTaskInputState>((set) => ({
  inputValue: '',
  setInputValue: (value) => set({ inputValue: value }),
}));

export default useQuickTaskInputState;
