import { useEffect, useRef } from "react";

export function useSfx()
{
    const hoverSfxRef = useRef<HTMLAudioElement | null>(null);
    const clickSfxRef = useRef<HTMLAudioElement | null>(null);
    const lastHoverAtRef = useRef<number>(0);

    useEffect(() => {
        // Preload to avoid first hover lag
        hoverSfxRef.current = new Audio("/sfx/menu-hover.wav");
        clickSfxRef.current = new Audio("/sfx/menu-click.wav");

        hoverSfxRef.current.preload = "auto";
        clickSfxRef.current.preload = "auto";

        // Adjust volume
        hoverSfxRef.current.volume = Number(localStorage.getItem("globalVolume")) ?? 0.35;
        clickSfxRef.current.volume = Number(localStorage.getItem("globalVolume")) ?? 0.35;

        return () => {
        hoverSfxRef.current = null;
        clickSfxRef.current = null;
        };
    }, []);

    const playSfx = async (a: HTMLAudioElement | null) => {
        if (!a) return;
        try {
        a.currentTime = 0;
        await a.play();
        } catch {
        
        }
    };

    const playHoverSfx = () => {
        const now = Date.now();
        if (now - lastHoverAtRef.current < 80) return; // throttle hover spam
        lastHoverAtRef.current = now;
        void playSfx(hoverSfxRef.current);
    };

    const playClickSfx = () => {
        void playSfx(clickSfxRef.current);
    };

    return {playHoverSfx, playClickSfx};
}