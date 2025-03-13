import React from "react";

interface Totals {
    equals: boolean;
    total: number | null;
    next: number | null;
    operation: string | null;
}

export interface WorkingProps {
    totals: Totals;
}

export const Working: React.FC<WorkingProps> = ({ totals }) => {
    return (
        <div className="display" id="display">
            <span className="mb-3 total">
                {totals.total}
                {totals.operation}
                {totals.next}
            </span>
        </div>
    );
};