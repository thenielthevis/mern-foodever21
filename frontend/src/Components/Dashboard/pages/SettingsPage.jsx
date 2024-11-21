import Header from "../../Dashboard/common/Header";
import ConnectedAccounts from "../../Dashboard/settings/ConnectedAccounts";
import DangerZone from "../../Dashboard/settings/DangerZone";
import Notifications from "../../Dashboard/settings/Notifications";
import Profile from "../../Dashboard/settings/Profile";
import Security from "../../Dashboard/settings/Security";

const SettingsPage = () => {
    return (
        <div className='flex-1 overflow-auto relative z-10 bg-gray-900'>
            <Header title='Settings' />
            <main className='max-w-4xl mx-auto py-6 px-4 lg:px-8'>
                <Profile />
                <Notifications />
                <Security />
                <ConnectedAccounts />
                <DangerZone />
            </main>
        </div>
    );
};

export default SettingsPage;