export default function Stars()
{
    return (
        <div
            className="absolute inset-0 opacity-60"
            style={{
                backgroundImage:
                "radial-gradient(circle at 20% 20%,rgba(255,255,255,0.9) 0,transparent 40px)," +
                "radial-gradient(circle at 75% 15%,rgba(255,255,255,0.8) 0,transparent 45px)," +
                "radial-gradient(circle at 60% 35%,rgba(255,255,255,0.6) 0,transparent 35px)," +
                "radial-gradient(circle at 30% 40%,rgba(255,255,255,0.5) 0,transparent 30px)",
            }}
        />
    )
}