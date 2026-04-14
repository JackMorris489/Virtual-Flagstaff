import { Fragment, useState } from "react"
import OptionItem from "./OptionItem";

export default function OptionsList({options, setOptions})
{
    const [isEditing, setIsEditing] = useState(false)
    const [option, setOption] = useState("")

    const handleEdit = (o) => {
        setIsEditing(true);
        setOption(o);
    }

    const handleUpdate = (idx) => {
        setOptions([
            ...options.slice(0, idx),
            option,
            ...options.slice(idx+1)
        ])
    }

    const handleDelete = (idx) => {
        setOptions([
            ...options.slice(0, idx),
            ...options.slice(idx+1)
        ])
    }

    return (
        <li> 
            {options.map((o, i) => (
                <Fragment key={i}>
                    <OptionItem
                        option={o}
                        idx={i}
                        options={options}
                        setOptions={setOptions}
                    />
                    {/* <ul>
                        {isEditing
                            ? <>
                                <input 
                                    type="text"
                                    value={option}
                                    onChange={e => setOption(e.target.value)}
                                />
                            </>
                            : <>
                                {o}
                                <button 
                                    type="button"
                                    onClick={() => handleEdit(o)}
                                >
                                    EDIT
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => handleDelete(i)}
                                >
                                    DEL
                                </button>
                            </>
                        }
                    </ul> */}
                </Fragment>
            ))}
        </li>
    )
}