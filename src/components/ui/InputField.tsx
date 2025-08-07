// ========================================================================
// FILE: src/components/ui/InputField.js
// ========================================================================
import React from 'react';

const InputField = ({ label, value, onChange, type = 'number', step = 'any', min = '0', unit }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700">{label}</label>
        <div className="mt-1 relative rounded-md shadow-sm">
            <input
                type={type}
                value={value}
                onChange={onChange}
                step={step}
                min={min}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
            {unit && <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500 text-sm">{unit}</div>}
        </div>
    </div>
);

export default InputField;