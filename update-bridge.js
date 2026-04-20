const fs = require('fs');
let content = fs.readFileSync('src/app/student/dashboard/_components/BridgeTab.tsx', 'utf8');

content = content.replace('import { DashboardSidebar } from \&quot;./DashboardSidebar\&quot;;\\n', '');
content = content.replace(' activeTab: TabId;\\n setActiveTab: (tab: TabId) => void;\\n}', ' activeTab: TabId;\\n setActiveTab: (tab: TabId) => void;\\n onOpenSidebar: () => void;\\n onOpenCheckIn: () => void;\\n onOpenBooking: () => void;\\n onOpenAnalytics: () => void;\\n}');

content = content.replace(' activeTab,\\n setActiveTab,\\n}: BridgeTabProps', ' activeTab,\\n setActiveTab,\\n onOpenSidebar,\\n onOpenCheckIn,\\n onOpenBooking,\\n onOpenAnalytics,\\n}: BridgeTabProps');

content = content.replace('  const [sidebarOpen, setSidebarOpen] = useState(false);\\n', '');

const regexWrapper = / <>\\r?\\n      <div className=\&quot;flex h-full min-h-0 bg-\\[var\\(--color-surface-tinted\\)\\] lg:bg-\\[var\\(--color-background\\)\\]\&quot;>\\r?\\n        <DashboardSidebar[\\s\\S]*? setSidebarOpen={setSidebarOpen}\\r?\\n        \\/>\\r?\\n/;
content = content.replace(regexWrapper, '');

content = content.replace(/onClick=\\{\\(\\) => setSidebarOpen\\(true\\)\\}/g, 'onClick={onOpenSidebar}');

content = content.replace(/      <\\/div>\\r?\\n    <\\/section>\\r?\\n    <\\/>/, '    </section>');
fs.writeFileSync('src/app/student/dashboard/_components/BridgeTab.tsx', content);

