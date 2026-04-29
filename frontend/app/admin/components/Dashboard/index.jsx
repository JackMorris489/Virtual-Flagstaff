import DashboardSection from "./DashboardSection";
import IncentivesDashboard from "./IncentivesDashboard";
import NpcsDashboard from "./NPCsDashboard";
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
            <DashboardSection title="Incentives">
                <IncentivesDashboard/>
            </DashboardSection>
            <DashboardSection title="Non-Playable Characters">
                <NpcsDashboard/>
            </DashboardSection>
        </>
    )
}