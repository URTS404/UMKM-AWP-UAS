import { useCalculatorStore } from '../stores/calculatorStore';
import { X } from 'lucide-react';

export default function CalculatorModal() {
  const { 
    isOpen, 
    display, 
    closeCalculator, 
    inputNumber, 
    inputOperation, 
    inputDecimal, 
    clear, 
    calculate 
  } = useCalculatorStore();

  if (!isOpen) return null;

  const buttons = [
    { label: 'C', action: clear, className: 'bg-red-500 hover:bg-red-600 text-white' },
    { label: '÷', action: () => inputOperation('÷'), className: 'bg-purple-600 hover:bg-purple-700 text-white' },
    { label: '×', action: () => inputOperation('×'), className: 'bg-purple-600 hover:bg-purple-700 text-white' },
    { label: '-', action: () => inputOperation('-'), className: 'bg-purple-600 hover:bg-purple-700 text-white' },
    { label: '7', action: () => inputNumber('7') },
    { label: '8', action: () => inputNumber('8') },
    { label: '9', action: () => inputNumber('9') },
    { label: '+', action: () => inputOperation('+'), className: 'bg-purple-600 hover:bg-purple-700 text-white row-span-2' },
    { label: '4', action: () => inputNumber('4') },
    { label: '5', action: () => inputNumber('5') },
    { label: '6', action: () => inputNumber('6') },
    { label: '1', action: () => inputNumber('1') },
    { label: '2', action: () => inputNumber('2') },
    { label: '3', action: () => inputNumber('3') },
    { label: '=', action: calculate, className: 'bg-green-500 hover:bg-green-600 text-white row-span-2' },
    { label: '0', action: () => inputNumber('0'), className: 'col-span-2' },
    { label: '.', action: inputDecimal }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Calculator</h3>
          <button
            onClick={closeCalculator}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Display */}
        <div className="p-4">
          <div className="bg-gray-100 rounded-lg p-4 mb-4 text-right">
            <div className="text-2xl font-mono text-gray-800 min-h-8 flex items-center justify-end">
              {display}
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {buttons.map((button, index) => (
              <button
                key={index}
                onClick={button.action}
                className={`
                  h-12 rounded-lg font-medium text-lg transition-colors
                  ${button.className || 'bg-gray-100 hover:bg-gray-200 text-gray-800'}
                  ${button.label === '0' ? 'col-span-2' : ''}
                  ${button.label === '+' || button.label === '=' ? 'row-span-2' : ''}
                  active:scale-95
                `}
                style={button.label === '+' || button.label === '=' ? { gridRow: button.label === '+' ? 'span 2' : 'span 2' } : {}}
              >
                {button.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}