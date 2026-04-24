import { useEffect, useState } from "react"
import apiFetch from "../../../../utils/apiFetch"

function NpcsTableHeader()
{
    return (
        <thead>
            <tr>
                <th scope="col">Name</th>
                <th scope="col">X Position</th>
                <th scope="col">Y Position</th>
                <th scope="col">Dialog</th>
                <th scope="col">Actions</th>
            </tr>
        </thead>
    )
}


function DialogRead({dialog})
{
    const maxLength = Math.max(
        dialog.initial.length,
        dialog.inProgress.length,
        dialog.completed.length
    );

    return (
        <table>
            <thead>
                <tr>
                    <th>Initial</th>
                    <th>In Progress</th>
                    <th>Completed</th>
                </tr>
            </thead>
            <tbody>
                {Array.from({length: maxLength}).map((_, idx) => (
                    <tr key={idx}>
                        <td>{dialog.initial[idx] ?? ""}</td>
                        <td>{dialog.inProgress[idx] ?? ""}</td>
                        <td>{dialog.completed[idx] ?? ""}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}


function NpcRead({npc, onEditClick})
{
    return (
        <>
            <td>{npc.name}</td>
            <td>{npc.x_pos}</td>
            <td>{npc.y_pos}</td>
            <td><DialogRead dialog={npc.dialog}/></td>
            <td>
                <button
                    type="button"
                    onClick={onEditClick}
                >
                    EDIT
                </button>
            </td>
        </>
    )
}


function DialogEdit({dialog, setDialog, onDialogChange})
{
    const maxLength = Math.max(
        dialog.initial.length,
        dialog.inProgress.length,
        dialog.completed.length
    );

    return (
        <table>
            <thead>
                <tr>
                    <th>Initial</th>
                    <th>In Progress</th>
                    <th>Completed</th>
                </tr>
            </thead>
            {Array.from({length: maxLength}).map((_, idx) => (
                <tr key={idx}>
                    <td>
                        {dialog.initial[idx] !== undefined &&
                            (
                                <textarea
                                    type="text"
                                    value={dialog.initial[idx]}
                                    onChange={e => onDialogChange(e.target.value, "initial", idx)}
                                />
                            )

                        }
                    </td>
                    <td>
                        {dialog.inProgress[idx] !== undefined &&
                            (
                                <textarea
                                    type="text"
                                    value={dialog.inProgress[idx]}
                                    onChange={e => onDialogChange(e.target.value, "inProgress", idx)}
                                />
                            )

                        }
                    </td>
                    <td>
                        {dialog.completed[idx] !== undefined &&
                            (
                                <textarea
                                    type="text"
                                    value={dialog.completed[idx]}
                                    onChange={e => onDialogChange(e.target.value, "completed", idx)}
                                />
                            )

                        }
                    </td>
                </tr>
            ))}
        </table>
    )
}


function NpcEdit({
    name, 
    setName,
    xPos,
    set_xPos,
    yPos,
    set_yPos,
    dialog,
    setDialog,
    onUpdateClick,
    onCancelClick
})
{
    const handleDialogChange = (value, type, idx) => {
        setDialog(prev => {
            const newArray = [...prev[type]];
            newArray[idx] = value;

            return {
                ...prev,
                [type]: newArray
            };
        });
    }

    return (
        <>
            <td>
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
            </td>
            <td>
                <input
                    type="number"
                    value={xPos}
                    onChange={e => set_xPos(e.target.value)}
                />
            </td>
            <td>
                <input
                    type="number"
                    value={yPos}
                    onChange={e => set_yPos(e.target.value)}
                />
            </td>
            <td>
                <DialogEdit
                    dialog={dialog}
                    setDialog={setDialog}
                    onDialogChange={handleDialogChange}
                />
            </td>
            <td>
                <button
                    type="button"
                    onClick={onUpdateClick}
                >
                    UPDATE
                </button>
                <button
                    type="button"
                    onClick={onCancelClick}
                >
                    CANCEL
                </button>
            </td>
        </>
    )
}


function NPC({npc, refreshNpcs})
{
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(npc.name);
    const [xPos, set_xPos] = useState(npc.x_pos);
    const [yPos, set_yPos] = useState(npc.y_pos);
    const [dialog, setDialog] = useState(npc.dialog);

    const refreshVars = () => {
        setName(npc.name);
        set_xPos(npc.x_pos);
        set_yPos(npc.y_pos);
        setDialog(npc.dialog);
    }

    const refresh = async () => {
        await refreshNpcs();
        refreshVars();
    }

    const handleEdit = () => {
        refresh();
        setIsEditing(true);
    }
    
    const handleCancel = () => {
        refresh();
        setIsEditing(false);
    }


    const handleUpdate = async () => {
        await apiFetch(`/npcs/${npc.key}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({name, x_pos: xPos, y_pos: yPos, dialog})
        })
        refresh();
        setIsEditing(false);
    }

    return (
        <>
            {isEditing
                ? (
                    <NpcEdit
                        name={name}
                        setName={setName}
                        xPos={xPos}
                        set_xPos={set_xPos}
                        yPos={yPos}
                        set_yPos={set_yPos}
                        dialog={dialog}
                        setDialog={setDialog}
                        onUpdateClick={handleUpdate}
                        onCancelClick={handleCancel}
                    />
                )
                : (
                    <NpcRead
                        npc={npc}
                        onEditClick={handleEdit}
                    />
                )
            }
        </>
    )
}

function NPCs({npcs, refreshNpcs})
{
    return (
        <tbody>
            {npcs.map(n => (
                <tr key={n.id}>
                    <NPC
                        npc={n}
                        refreshNpcs={refreshNpcs}
                    />
                </tr>
            ))}
        </tbody>
    )
}

export default function NpcsDashboard() {
    const [npcs, setNpcs] = useState([])

    const fetchNpcs = async () => {
        return await apiFetch("/npcs");
    };

    const refreshNpcs = async () => {
        const n = await fetchNpcs();
        setNpcs(n);
    };

    const initialize = async () => {
        await refreshNpcs();
    };

    useEffect(() => {initialize()}, [])

    return (
        <table>
            <NpcsTableHeader/>
            <NPCs npcs={npcs} refreshNpcs={refreshNpcs}/>
        </table>
    )
}