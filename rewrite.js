const fs = require('fs');

let mindTab = fs.readFileSync('src/app/student/dashboard/_components/MindTab.tsx', 'utf8');
mindTab = mindTab.replace(/import \{ CheckInModal \} from "\.\/CheckInModal";\r?\n/g, '');
mindTab = mindTab.replace(/import \{ BookingModal \} from "\.\/BookingModal";\r?\n/g, '');
mindTab = mindTab.replace(/import \{ AnalyticsModal \} from "\.\/AnalyticsModal";\r?\n/g, '');
mindTab = mindTab.replace(/import \{ DashboardSidebar \} from "\.\/DashboardSidebar";\r?\n/g, '');
mindTab = mindTab.replace(
  ' activeTab: TabId;\n setActiveTab: (tab: TabId) => void;\n}',
  ` activeTab: TabId;\n setActiveTab: (tab: TabId) => void;\n onOpenSidebar: () => void;\n onOpenCheckIn: () => void;\n onOpenBooking: () => void;\n onOpenAnalytics: () => void;\n}`
);
mindTab = mindTab.replace(
  ' activeTab,\n setActiveTab,\n}: MindTabProps',
  ' activeTab,\n setActiveTab,\n onOpenSidebar,\n onOpenCheckIn,\n onOpenBooking,\n onOpenAnalytics,\n}: MindTabProps'
);
mindTab = mindTab.replace(/ const \[showCheckIn[\s\S]*?\] = useState\(false\);\r?\n/, '');
mindTab = mindTab.replace(/ const \[showBookingModal[\s\S]*?\] = useState\(false\);\r?\n/, '');
mindTab = mindTab.replace(/ const \[showAnalyticsModal[\s\S]*?\] = useState\(false\);\r?\n/, '');
mindTab = mindTab.replace(/ const \[sidebarOpen[\s\S]*?\] = useState\(false\);\r?\n/, '');
mindTab = mindTab.replace(/ const isCheckInOpen = showCheckIn \|\| Boolean\(autoOpenCheckIn\);\r?\n/, '');
mindTab = mindTab.replace(/ const handleCloseCheckIn = \(\) => \{\r?\n setShowCheckIn\(false\);\r?\n onAutoOpenCheckInHandled\?\.\(\);\r?\n \};\r?\n\r?\n/, '');
mindTab = mindTab.replace(/ <>(\r?\n) <div className="flex h-full min-h-0 bg-\[var\(--color-surface-tinted\)\] lg:bg-\[var\(--color-background\)\]">(\r?\n) <DashboardSidebar[\s\S]*? setSidebarOpen={setSidebarOpen}\r?\n \/>(\r?\n)+ {\/\* Main Content Area \*\/}\r?\n/, '<>\r\n');
mindTab = mindTab.replace(/setSidebarOpen\(true\)/g, 'onOpenSidebar()');
mindTab = mindTab.replace(/setShowBookingModal\(true\)/g, 'onOpenBooking()');
mindTab = mindTab.replace(/setShowAnalyticsModal\(true\)/g, 'onOpenAnalytics()');
mindTab = mindTab.replace(/setShowCheckIn\(true\)/g, 'onOpenCheckIn()');
mindTab = mindTab.replace(/ <\/div>\r?\n <\/section>\r?\n <\/div>\r?\n\r?\n <CheckInModal[\s\S]*/, ' </section>\r\n </>\r\n );\r\n}');
fs.writeFileSync('src/app/student/dashboard/_components/MindTab.tsx', mindTab);

let bridgeTab = fs.readFileSync('src/app/student/dashboard/_components/BridgeTab.tsx', 'utf8');
bridgeTab = bridgeTab.replace(/import \{ DashboardSidebar \} from "\.\/DashboardSidebar";\r?\n/, '');
bridgeTab = bridgeTab.replace(
  ' activeTab: TabId;\n setActiveTab: (tab: TabId) => void;\n}',
  ` activeTab: TabId;\n setActiveTab: (tab: TabId) => void;\n onOpenSidebar: () => void;\n onOpenCheckIn: () => void;\n onOpenBooking: () => void;\n onOpenAnalytics: () => void;\n}`
);
bridgeTab = bridgeTab.replace(
  ' activeTab,\n setActiveTab,\n}: BridgeTabProps',
  ' activeTab,\n setActiveTab,\n onOpenSidebar,\n onOpenCheckIn,\n onOpenBooking,\n onOpenAnalytics,\n}: BridgeTabProps'
);
bridgeTab = bridgeTab.replace(/ const \[sidebarOpen, setSidebarOpen\] = useState\(false\);\r?\n/, '');
bridgeTab = bridgeTab.replace(/ <>(\r?\n) <div className="flex h-full min-h-0 bg-\[var\(--color-surface-tinted\)\] lg:bg-\[var\(--color-background\)\]">(\r?\n) <DashboardSidebar[\s\S]*? setSidebarOpen={setSidebarOpen}\r?\n \/>(\r?\n)/, '');
bridgeTab = bridgeTab.replace(/onClick=\{\(\) => setSidebarOpen\(true\)\}/g, 'onClick={onOpenSidebar}');
bridgeTab = bridgeTab.replace(/ <\/div>\r?\n <\/section>\r?\n <\/>/, ' </section>');
fs.writeFileSync('src/app/student/dashboard/_components/BridgeTab.tsx', bridgeTab);

let page = fs.readFileSync('src/app/student/dashboard/page.tsx', 'utf8');
page = page.replace(
  `import { BridgeTab } from './_components/BridgeTab'`,
  `import { BridgeTab } from './_components/BridgeTab'
import { DashboardSidebar } from './_components/DashboardSidebar'
import { CheckInModal } from './_components/CheckInModal'
import { BookingModal } from './_components/BookingModal'
import { AnalyticsModal } from './_components/AnalyticsModal'`
);
page = page.replace(
  `const [sessionId, setSessionId] = useState('')`,
  `const [sessionId, setSessionId] = useState('')
 const [showCheckIn, setShowCheckIn] = useState(false)
 const [showBookingModal, setShowBookingModal] = useState(false)
 const [showAnalyticsModal, setShowAnalyticsModal] = useState(false)
 const [sidebarOpen, setSidebarOpen] = useState(false)`
);

const newReturn = `return (
 <div className="[--brm:0.78] flex h-full overflow-hidden bg-[var(--color-surface-tinted)] lg:bg-[var(--color-background)]">
 <DashboardSidebar
 userName={userName}
 activeTab={activeTab}
 setActiveTab={setActiveTab}
 onSwitchToBridge={() => setActiveTab("bridge")}
 onSwitchToMind={() => setActiveTab("mind")}
 startNewSession={startNewSession}
 onOpenQuestionnaire={() => setShowQuestionnaire(true)}
 setShowCheckIn={setShowCheckIn}
 setShowBookingModal={setShowBookingModal}
 setShowAnalyticsModal={setShowAnalyticsModal}
 sidebarOpen={sidebarOpen}
 setSidebarOpen={setSidebarOpen}
 />
 <div className="flex flex-1 flex-col lg:flex-row overflow-hidden bg-[var(--color-surface-tinted)] lg:bg-[var(--color-background)]">
 <div className={\`h-full w-full lg:w-1/2 \${activeTab === 'mind' ? 'block' : 'hidden'} lg:block\`}>
 <MindTab
 userName={userName}
 data={data}
 messages={messages}
 sendMessage={sendMessage}
 isLoading={isLoading}
 error={error}
 stopGenerating={stopGenerating}
 startNewSession={startNewSession}
 autoOpenCheckIn={pendingCheckInOpen}
 onAutoOpenCheckInHandled={handleAutoOpenCheckInHandled}
 onMoodLogged={refreshDashboardInsights}
 onOpenQuestionnaire={() => setShowQuestionnaire(true)}
 onSwitchToBridge={() => setActiveTab("bridge")}
 activeTab={activeTab}
 setActiveTab={setActiveTab}
 onOpenSidebar={() => setSidebarOpen(true)}
 onOpenCheckIn={() => setShowCheckIn(true)}
 onOpenBooking={() => setShowBookingModal(true)}
 onOpenAnalytics={() => setShowAnalyticsModal(true)}
 />
 </div>
 <div className={\`h-full w-full lg:w-1/2 \${activeTab === 'bridge' ? 'block' : 'hidden'} lg:block\`}>
 <BridgeTab
 data={data}
 userName={userName}
 metrics={metrics}
 moodHistory={moodHistory}
 averageMood={averageMood}
 bestDay={bestDay}
 worstDay={worstDay}
 trendDirection={trendDirection}
 completedDays={scored.length}
 onOpenQuestionnaire={() => setShowQuestionnaire(true)}
 onSwitchToMind={() => setActiveTab("mind")}
 activeTab={activeTab}
 setActiveTab={setActiveTab}
 onOpenSidebar={() => setSidebarOpen(true)}
 onOpenCheckIn={() => setShowCheckIn(true)}
 onOpenBooking={() => setShowBookingModal(true)}
 onOpenAnalytics={() => setShowAnalyticsModal(true)}
 />
 </div>
 </div>
 <CheckInModal isOpen={showCheckIn || pendingCheckInOpen} onClose={() => { setShowCheckIn(false); handleAutoOpenCheckInHandled(); }} onComplete={refreshDashboardInsights} />
 <BookingModal isOpen={showBookingModal} onClose={() => setShowBookingModal(false)} />
 <AnalyticsModal isOpen={showAnalyticsModal} onClose={() => setShowAnalyticsModal(false)} onGoToDashboard={() => setActiveTab('bridge')} />`;

page = page.replace(/return \([\s\S]+?<\/AnimatePresence>/m, newReturn);
fs.writeFileSync('src/app/student/dashboard/page.tsx', page);
