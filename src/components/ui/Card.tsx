// ========================================================================
// FILE: src/components/ui/Card.js
// ========================================================================
import React from 'react';

const Card = ({ children, className = '' }) => (
    <div className={`bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 ${className}`}>
        {children}
    </div>
);

export default Card;
