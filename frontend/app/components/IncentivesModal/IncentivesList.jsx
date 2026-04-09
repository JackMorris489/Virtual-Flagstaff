export default function IncentivesList({
    incentives,
    inputs,
    onChange
})
{
    return (
        <>
            {incentives.map(
                (incentive, idx) => (
                    <label key={idx}>
                        <input
                            type="checkbox"
                            checked={inputs[idx] ?? false}
                            onChange={() => onChange(idx)}
                        />
                        {incentive.name}, Points: {incentive.required_points}
                    </label>
                )
            )}
        </>
    )
}