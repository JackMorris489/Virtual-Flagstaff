import IncentivesDashboard from "./IncentivesDashboard";
import NpcsDashboard from "./NpcsDashboard";
import QuestsDashboard from "./QuestsDashboard";
import SurveryDashboard from "./SurveryDashboard";

export default function Dashboard()
{
    return (
        <>
            <SurveryDashboard/>
            <QuestsDashboard/>
            <NpcsDashboard/>
            <IncentivesDashboard/>
        </>
    )
}