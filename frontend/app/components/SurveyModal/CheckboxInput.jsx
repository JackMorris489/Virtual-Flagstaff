export default function CheckboxInput({
    name,
    values,
    options,
    onChange,
    idx
})
{
    return (
        <fieldset className="grid gap-2 border-[3px] border-white p-3">
            <legend className="px-2 text-[10px] uppercase tracking-widest">
            {name}
            </legend>
            <div className="grid gap-2">
            {options.map((o, i) => (
                <label key={i} className="flex items-center gap-2 text-[10px]">
                    <input
                        type="checkbox"
                        checked={values?.includes(o)}
                        onChange={() => onChange(o, idx)}
                    />
                    <span>{o}</span>
                </label>
            ))}
            </div>
        </fieldset>
    )
}