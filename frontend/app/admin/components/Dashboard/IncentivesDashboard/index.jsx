import { useEffect, useState } from "react"
import apiFetch from "../../../../utils/apiFetch"
import { ref } from "node:process"

function IncentivesTableHeader()
{
    return (
        <thead>
            <tr>
                <th scope="col">Incentive</th>
                <th scope="col">Required Points</th>
                <th scope="col">Actions</th>
            </tr>
        </thead>
    )
}


function IncentiveEdit({
    incentive,
    setIncentive,
    reqPts,
    setReqPts,
    onUpdateClick,
    onCancelClick
})
{

    return (
        <>
            <td>
                <input
                    type="text"
                    value={incentive}
                    onChange={e => setIncentive(e.target.value)}
                />
            </td>
            <td>
                <input
                    type="number"
                    value={reqPts}
                    onChange={e => setReqPts(e.target.value)}
                    min={0}
                    step={1}
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


function IncentiveRead({incentive, onEditClick, onDeleteClick})
{
    return (
        <>
            <td>
                <p>{incentive.name}</p>
            </td>
            <td>
                <p>{incentive.required_points}</p>
            </td>
            <td>
                <button
                    type="button"
                    onClick={onEditClick}
                >
                    EDIT
                </button>
                <button
                    type="button"
                    onClick={onDeleteClick}
                >
                    DELETE
                </button>
            </td>
        </>
    )
}



function ExistingIncentive({incentive, refreshIncentives})
{
    const [isEditing, setIsEditing] = useState(false);

    const [name, setName] = useState(incentive.name);
    const [reqPts, setReqPts] = useState(incentive.required_points);

    const refreshVars = () => {
        setName(incentive.name);
        setReqPts(incentive.required_points);
    }

    const refresh = async () => {
        await refreshIncentives();
        refreshVars();
    }

    const deleteIncentive = async (id) => {
        return apiFetch(`/incentives/${id}`, {method: "DELETE"});
    }

    const handleDelete = async () => {
        await deleteIncentive(incentive.id);
        refresh();
    }

    const updateIncentive = async (id) => {
        return await apiFetch(`/incentives/${id}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({name, required_points: reqPts})
        });
    }

    const handleUpdate = async () => {
        await updateIncentive(incentive.id);
        refresh();
        setIsEditing(false);
    }

    const handleCancel = () => {
        refresh();
        setIsEditing(false);
    }

    const handleEdit = () => {
        refresh();
        setIsEditing(true);
    }

    return (
        <>
            {isEditing
                ? <IncentiveEdit
                    incentive={name}
                    setIncentive={setName}
                    reqPts={reqPts}
                    setReqPts={setReqPts}
                    onUpdateClick={handleUpdate}
                    onCancelClick={handleCancel}
                />
                : <IncentiveRead 
                    incentive={incentive}
                    onEditClick={handleEdit}
                    onDeleteClick={handleDelete}
                />
            }
        </>
    )
}


function ExistingIncentives({incentives, refreshIncentives})
{
    return (
        <>
            {incentives.map((i, idx) => (
                <tr key={idx}>
                    <ExistingIncentive 
                        incentive={i} 
                        refreshIncentives={refreshIncentives}
                    />
                </tr>
            ))}
        </>
    )
}


function IncentiveForm({refreshIncentives})
{
    const [name, setName] = useState("");
    const [reqPts, setReqPts] = useState(0);
    
    const clear = () => {
        setName("");
        setReqPts(0);
    }

    const createIncentive = async () => {
        return await apiFetch("/incentives", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({name, required_points: reqPts})
        })
    }

    const handleCreate = async () => {
        try
        {
            await createIncentive();
            refreshIncentives();
            clear();
        }
        catch (err)
        {

        }
    }

    return (
        <tr>
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
                    value={reqPts}
                    onChange={e => setReqPts(e.target.value)}
                    min={0}
                    step={1}
                />
            </td>
            <td>
                <button
                    type="button"
                    onClick={handleCreate}
                >
                    CREATE
                </button>
            </td>
        </tr>
    )
}


export default function IncentivesDashboard()
{
    const [incentives, setIncentives] = useState([])

    const fetchIncentives = async () => {
        return await apiFetch("/incentives");
    }

    const refreshIncentives = async () => {
        const newIncentives = await fetchIncentives();
        setIncentives(newIncentives ?? []);
    }

    const initialize = refreshIncentives;

    useEffect(() => {initialize()}, [])

    return (
        <table>
            <IncentivesTableHeader/>
            <tbody>
                <IncentiveForm
                    refreshIncentives={refreshIncentives}
                />
                <ExistingIncentives
                    incentives={incentives}
                    refreshIncentives={refreshIncentives}
                />
            </tbody>
        </table>
    )
}