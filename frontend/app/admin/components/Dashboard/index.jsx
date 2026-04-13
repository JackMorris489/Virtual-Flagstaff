import IncentivesDashboard from "./IncentivesDashboard";
import NpcsDashboard from "./NpcsDashboard";
import QuestsDashboard from "./QuestsDashboard";
import SurveyDashboard from "./SurveyDashboard";

export default function Dashboard()
{
    return (
        <>
            <SurveyDashboard/>
            <QuestsDashboard/>
            <NpcsDashboard/>
            <IncentivesDashboard/>
        </>
    )
}