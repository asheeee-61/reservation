import { create } from 'zustand';

export const useWizardStore = create((set) => ({
  isOpen: false,
  currentStep: 0,
  isCompleted: false,

  startWizard: () => set({ isOpen: true, currentStep: 0, isCompleted: false }),
  
  nextStep: () => set((state) => ({ 
    currentStep: state.currentStep + 1 
  })),
  
  prevStep: () => set((state) => ({ 
    currentStep: Math.max(0, state.currentStep - 1) 
  })),
  
  setStep: (step) => set({ currentStep: step }),
  
  closeWizard: () => set({ isOpen: false, currentStep: 0 }),
  
  completeWizard: () => set({ isOpen: false, isCompleted: true, currentStep: 0 }),
}));
