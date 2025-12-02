import { create } from 'zustand';

interface CalculatorState {
  isOpen: boolean;
  display: string;
  previousValue: number | null;
  operation: string | null;
  waitingForNewValue: boolean;
  
  openCalculator: () => void;
  closeCalculator: () => void;
  toggleCalculator: () => void;
  
  inputNumber: (num: string) => void;
  inputOperation: (op: string) => void;
  inputDecimal: () => void;
  clear: () => void;
  calculate: () => void;
}

export const useCalculatorStore = create<CalculatorState>((set, get) => ({
  isOpen: false,
  display: '0',
  previousValue: null,
  operation: null,
  waitingForNewValue: false,
  
  openCalculator: () => set({ isOpen: true }),
  closeCalculator: () => set({ isOpen: false }),
  toggleCalculator: () => set((state) => ({ isOpen: !state.isOpen })),
  
  inputNumber: (num) => {
    const { display, waitingForNewValue } = get();
    
    if (waitingForNewValue) {
      set({
        display: num,
        waitingForNewValue: false
      });
    } else {
      set({
        display: display === '0' ? num : display + num
      });
    }
  },
  
  inputOperation: (nextOperation) => {
    const { display, previousValue, operation } = get();
    const inputValue = parseFloat(display);
    
    if (previousValue === null) {
      set({
        previousValue: inputValue,
        operation: nextOperation,
        waitingForNewValue: true
      });
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculateOperation(currentValue, inputValue, operation);
      
      set({
        display: String(newValue),
        previousValue: newValue,
        operation: nextOperation,
        waitingForNewValue: true
      });
    }
  },
  
  inputDecimal: () => {
    const { display, waitingForNewValue } = get();
    
    if (waitingForNewValue) {
      set({
        display: '0.',
        waitingForNewValue: false
      });
    } else if (display.indexOf('.') === -1) {
      set({ display: display + '.' });
    }
  },
  
  clear: () => {
    set({
      display: '0',
      previousValue: null,
      operation: null,
      waitingForNewValue: false
    });
  },
  
  calculate: () => {
    const { display, previousValue, operation } = get();
    
    if (previousValue !== null && operation) {
      const inputValue = parseFloat(display);
      const newValue = calculateOperation(previousValue, inputValue, operation);
      
      set({
        display: String(newValue),
        previousValue: null,
        operation: null,
        waitingForNewValue: true
      });
    }
  }
}));

function calculateOperation(firstValue: number, secondValue: number, operation: string): number {
  switch (operation) {
    case '+':
      return firstValue + secondValue;
    case '-':
      return firstValue - secondValue;
    case '×':
      return firstValue * secondValue;
    case '÷':
      return secondValue !== 0 ? firstValue / secondValue : 0;
    default:
      return secondValue;
  }
}