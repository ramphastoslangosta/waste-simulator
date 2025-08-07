// ========================================================================
// FILE: src/components/ui/KPICard.js
// ========================================================================
import React from 'react';
import Card from './Card.tsx';

const KPICard = ({ title, value, unit, description, color = 'text-blue-600' }) => (
    <Card>
        <p className="text-sm text-slate-600 font-semibold uppercase tracking-wide">{title}</p>
        <p className={`text-4xl font-bold mt-1 ${color}`}>{value}<span className="text-2xl ml-1">{unit}</span></p>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">{description}</p>
    </Card>
);

export default KPICard;