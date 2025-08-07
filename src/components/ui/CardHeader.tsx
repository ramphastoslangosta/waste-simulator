// ========================================================================
// FILE: src/components/ui/CardHeader.js
// ========================================================================
import React from 'react';

const CardHeader = ({ title, subtitle, icon }) => (
    <div className="mb-4 border-b border-slate-200 pb-3 flex items-center">
        {icon && <div className="mr-3 text-blue-600">{icon}</div>}
        <div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
    </div>
);

export default CardHeader;
