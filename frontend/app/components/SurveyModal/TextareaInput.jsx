export default function TextareaInput({
    name,
    value,
    onChange,
    idx
})
{
    return (
        <label className="grid gap-2 text-[10px] uppercase tracking-widest">
            <span>{name}</span>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value, idx)}
                className="min-h-[80px] rounded-none border-[3px] border-white bg-black px-3 py-2 text-xs text-white placeholder-white/50 outline-none"
            />
        </label>
    )
}