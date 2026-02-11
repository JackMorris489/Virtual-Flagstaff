export default function PixelGrid()
{
    return (
        <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
                backgroundImage:
                "linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)",
                backgroundSize: "16px 16px",
            }}
        />
        )
}