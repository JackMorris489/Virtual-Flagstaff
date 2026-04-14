export default function OptionsList({options, setOptions})
{
    return (
        <li> 
            {options.map((o, i) => (
                <ul key={i}>{o}</ul>
            ))}
        </li>
    )
}