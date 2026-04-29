export default function TextInput({
    name,
    value,
    onChange,
    idx
})
{
    return (
        <label className="grid gap-2 text-[10px] uppercase tracking-widest">
            <span>{name}</span>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value, idx)}
              className="rounded-none border-[3px] border-white bg-black px-3 py-2 text-xs text-white outline-none"
            />
          </label>
    )
}