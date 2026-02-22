export default function Scanlines()
{
    return (
        <div
            className="absolute inset-0 mix-blend-overlay opacity-[0.08]"
            style={{
                backgroundImage:
                "repeating-linear-gradient(0deg,rgba(255,255,255,0.4)_0px,rgba(255,255,255,0.4)_1px,transparent_1px,transparent_3px)",
            }}
        />
    )
}