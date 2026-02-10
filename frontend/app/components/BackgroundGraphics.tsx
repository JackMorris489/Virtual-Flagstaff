export default function BackgroundGraphics()
{
    return(
        <div className="pointer-events-none absolute inset-0 opacity-100">
            {/* night sky gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#0f172a_0,_#020617_55%,_#000000_100%)]" />

            {/* subtle pixel grid */}
            <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
                backgroundImage:
                "linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)",
                backgroundSize: "16px 16px",
            }}
            />

            {/* scanlines */}
            <div
            className="absolute inset-0 mix-blend-overlay opacity-[0.08]"
            style={{
                backgroundImage:
                "repeating-linear-gradient(0deg,rgba(255,255,255,0.4)_0px,rgba(255,255,255,0.4)_1px,transparent_1px,transparent_3px)",
            }}
            />

            {/* stars */}
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

            {/* distant mountains */}
            <div
            className="absolute inset-x-[-10%] bottom-20 h-44 bg-gradient-to-t from-[#020617] via-[#0f172a] to-transparent opacity-90"
            style={{
                clipPath:
                "polygon(0% 100%, 10% 65%, 22% 72%, 35% 52%, 48% 70%, 60% 45%, 72% 68%, 84% 50%, 100% 70%, 100% 100%)",
            }}
            />

            {/* mid mountains */}
            <div
            className="absolute inset-x-[-10%] bottom-10 h-40 bg-gradient-to-t from-[#022c22] via-[#065f46] to-transparent opacity-95"
            style={{
                clipPath:
                "polygon(0% 100%, 8% 70%, 18% 78%, 30% 60%, 42% 75%, 55% 55%, 68% 72%, 80% 60%, 92% 75%, 100% 62%, 100% 100%)",
            }}
            />

            {/* tree line */}
            <div
            className="absolute inset-x-0 bottom-0 h-16 bg-[repeating-linear-gradient(-90deg,#022c22_0,#022c22_8px,#064e3b_8px,#064e3b_16px)]"
            style={{
                boxShadow: "0 -4px 0 #000000",
            }}
            />

            {/* glowing grid ground */}
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
        </div>
    )
}