import PixelModal from "../PixelModal"
import {useSfx} from "../../hooks"

export default function IncentivesModal({
    open,
    setOpen
})
{
    const {playClickSfx} = useSfx();

    return (
        <PixelModal
            open={open}
            title="Incentives"
            onClose={
                () => {
                    playClickSfx();
                    setOpen(false);
                }
            }
        >
            <form
                onSubmit={
                    (e) => {
                    e.preventDefault();
                    setOpen(false);
                    }
                }
                className="grid gap-4"
            >
            </form>
        </PixelModal>
    );
}