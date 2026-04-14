export default function SelectInput({
    name,
    value,
    options,
    onChange,
    idx
})
{
    return (
        <label className="grid gap-2 text-[10px] uppercase tracking-widest">
            <span>{name}</span>
                <select
                    value={value ?? ""}
                    onChange={(e) => onChange(e.target.value, idx)}
                    className="rounded-none border-[3px] border-white bg-black px-3 py-2 text-xs text-white outline-none"
                >
                    <option value="" disabled hidden>
                        Select...
                    </option>
                    {options.map((o, i) => (
                        <option key={i} value={o}>
                            {o}
                        </option>
                    ))}
            </select>
        </label>
    )
}