import PixelModal from "./PixelModal"
import PixelButton from "./PixelButton"
import { useState, useRef } from "react"
import { useSfx } from "../hooks"

type ContactModalProps = {
    contactOpen: boolean
    setContactOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function ContactModal({
    contactOpen,
    setContactOpen
}: ContactModalProps )
{
    // Contact state
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [message, setMessage] = useState("");

    // Refs for initial focus
    const contactFirstRef = useRef<HTMLInputElement>(null);

    const {playClickSfx, playHoverSfx} = useSfx();

    return (
        <PixelModal
            open={contactOpen}
            title="Contact Us"
            onClose={() => {
                playClickSfx();
                setContactOpen(false)
            }}
        >
            <form
            onSubmit={(e) => {
                e.preventDefault();
                // TODO: replace with real submit
                alert(`Message sent by ${firstName} ${lastName}`);
                setContactOpen(false);
            }}
            className="grid gap-4"
            >
            <div className="grid grid-cols-2 gap-3">
                <label
                htmlFor="contact-first"
                className="grid gap-2 text-[10px] uppercase tracking-widest"
                >
                <span>First Name</span>
                <input
                    id="contact-first"
                    ref={contactFirstRef}
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="rounded-none border-[3px] border-white bg-black px-3 py-2 text-xs text-white placeholder-white/50 outline-none"
                    placeholder="First"
                />
                </label>

                <label
                htmlFor="contact-last"
                className="grid gap-2 text-[10px] uppercase tracking-widest"
                >
                <span>Last Name</span>
                <input
                    id="contact-last"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="rounded-none border-[3px] border-white bg-black px-3 py-2 text-xs text-white placeholder-white/50 outline-none"
                    placeholder="Last"
                />
                </label>
            </div>

            <label
                htmlFor="contact-email"
                className="grid gap-2 text-[10px] uppercase tracking-widest"
            >
                <span>Email</span>
                <input
                id="contact-email"
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="rounded-none border-[3px] border-white bg-black px-3 py-2 text-xs text-white placeholder-white/50 outline-none"
                placeholder="you@example.com"
                />
            </label>

            <label
                htmlFor="contact-message"
                className="grid gap-2 text-[10px] uppercase tracking-widest"
            >
                <span>Message</span>
                <textarea
                id="contact-message"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[8rem] rounded-none border-[3px] border-white bg-black px-3 py-2 text-xs text-white placeholder-white/50 outline-none"
                placeholder="Tell us about your move..."
                />
            </label>

            <div className="mt-2 flex items-center gap-3">
                <PixelButton
                    onClick={playClickSfx}
                    type="submit" 
                    ariaLabel="Submit contact form"
                >
                Send
                </PixelButton>
                <button
                    type="button"
                    onClick={() => {
                        playClickSfx();
                        setContactOpen(false)
                    }}
                    className="rounded-none border-[3px] border-white px-3 py-2 text-[10px] uppercase tracking-widest"
                    onMouseEnter={playHoverSfx}
                    onPointerEnter={playHoverSfx}
                    onFocus={playHoverSfx}
                >
                Cancel
                </button>
            </div>
            </form>
        </PixelModal>
    )
}