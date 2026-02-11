export default function GlowingGridGround()
{
    return (
        <div
            className="absolute inset-x-[-10%] bottom-[-40%] h-[60%] opacity-40"
            style={{
                backgroundImage:
                "linear-gradient(to top, rgba(34,197,94,0.5) 0, transparent 60%)," +
                "linear-gradient(#4ade80_1px,transparent_1px)," +
                "linear-gradient(90deg,#4ade80_1px,transparent_1px)",
                backgroundSize: "100% 100%, 40px 40px, 40px 40px",
                transform: "perspective(600px) rotateX(65deg)",
                transformOrigin: "top",
            }}
        />
    )
}