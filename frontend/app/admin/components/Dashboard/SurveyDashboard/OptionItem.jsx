import { useState } from "react";

export default function OptionItem({option, idx, options, setOptions})
{
    const [isEditing, setIsEditing] = useState(false)
    const [name, setName] = useState(option)

    const handleEdit = () => {
        setIsEditing(true);
    }

    const handleUpdate = (idx) => {
        setOptions([
            ...options.slice(0, idx),
            name,
            ...options.slice(idx+1)
        ]);

        setIsEditing(false);
    }

    const handleDelete = (idx) => {
        setOptions([
            ...options.slice(0, idx),
            ...options.slice(idx+1)
        ])
    }

    return (
        <ul>
            {isEditing
                ? <>
                    <input 
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                    <button 
                        type="button"
                        onClick={() => handleUpdate(idx)}
                    >
                        UPDATE
                    </button>
                </>
                : <>
                    {name}
                    <button 
                        type="button"
                        onClick={handleEdit}
                    >
                        EDIT
                    </button>
                    <button 
                        type="button"
                        onClick={() => handleDelete(idx)}
                    >
                        DEL
                    </button>
                </>
            }
        </ul>
    )
}