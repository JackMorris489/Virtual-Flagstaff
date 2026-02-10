import Sky from "./Sky"
import PixelGrid from "./PixelGrid"
import Scanlines from "./Scanlines"
import Stars from "./Stars"
import Mountains from "./Mountains"
import TreeLine from "./TreeLine"
import GlowingGridGround from "./GlowingGridGround"

export default function BackgroundGraphics()
{
    return(
        <div className="pointer-events-none absolute inset-0 opacity-100">
            <Sky/>
            <PixelGrid/>
            <Scanlines/>
            <Stars/>
            <Mountains/>
            <TreeLine/>
            <GlowingGridGround/>
        </div>
    )
}