import DashboardSection from "./DashboardSection";
import IncentivesDashboard from "./IncentivesDashboard";
import NpcsDashboard from "./NpcsDashboard";
import QuestsDashboard from "./QuestsDashboard";
import SurveyDashboard from "./SurveyDashboard";
import UsersDashboard from "./UsersDashboard";

export default function Dashboard()
{
    return (
        <>
            <DashboardSection title="Users">
                <UsersDashboard/>
            </DashboardSection>
            <DashboardSection title="Survey">
                <SurveyDashboard/>
            </DashboardSection>
            <QuestsDashboard/>
            <NpcsDashboard/>
            <IncentivesDashboard/>
        </>
    )
}