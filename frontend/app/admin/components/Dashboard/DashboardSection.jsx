import { useState } from "react";

export default function DashboardSection({ title, children }) {
    const [open, setOpen] = useState(false);

    return (
        <div>
            <button onClick={() => setOpen(prev => !prev)}>
                {title} Dashboard
            </button>

            {open && (
                <div>
                    {children}
                </div>
            )}
        </div>
    );
}