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


function DialogEdit({
    initialDialog,
    setInitialDialog,
    inProgressDialog,
    setInProgressDialog,
    completedDialog,
    setCompletedDialog
})
{
    const maxLength = Math.max(
        initialDialog.length,
        inProgressDialog.length,
        completedDialog.length
    );

    return (
        <>
            {Array.from({length: maxLength}).map((_, idx) => (
                <tr key={idx}>
                    <td>{dialog.initial[idx] ?? ""}</td>
                    <td>{dialog.inProgress[idx] ?? ""}</td>
                    <td>{dialog.completed[idx] ?? ""}</td>
                </tr>
            ))}
        </>
    )
}


function NpcEdit({
    name, 
    setName,
    xPos,
    set_xPos,
    yPos,
    set_yPos,
    onCancelClick
})
{
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
                {/* <textarea
                    value={""}
                    onChange={}
                /> */}
            </td>
            <td>
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

    const handleEdit = () => {
        setIsEditing(true);
    }
    
    const handleCancel = () => {
        setIsEditing(false);
        refreshNpcs();
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