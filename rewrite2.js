const fs = require('fs');

function updateMindTab() {
 let src = fs.readFileSync('src/app/student/dashboard/_components/MindTab.tsx', 'utf8');
 
 src = src.replace(/import \{ CheckInModal \} from "\.\/CheckInModal";\r?\n/, '');
 src = src.replace(/import \{ BookingModal \} from "\.\/BookingModal";\r?\n/, '');
 src = src.replace(/import \{ AnalyticsModal \} from "\.\/AnalyticsModal";\r?\n/, '');
 src = src.replace(/import \{ DashboardSidebar \} from "\.\/DashboardSidebar";\r?\n/, '');

 src = src.replace(
 '  activeTab: TabId;\n  setActiveTab: (tab: TabId) => void;\n}',
 `  activeTab: TabId;\n  setActiveTab: (tab: TabId) => void;\n  onOpenSidebar: () => void;\n  onOpenCheckIn: () => void;\n  onOpenBooking: () => void;\n  onOpenAnalytics: () => void;\n}`
 );

 src = src.replace(
 '  activeTab,\n  setActiveTab,\n}: MindTabProps',
 '  activeTab,\n  setActiveTab,\n  onOpenSidebar,\n  onOpenCheckIn,\n  onOpenBooking,\n  onOpenAnalytics,\n}: MindTabProps'
 );

 src = src.replace(/  const \[showCheckIn, setShowCheckIn\] = useState\(false\);\r?\n/, '');
 src = src.replace(/  const \[showBookingModal, setShowBookingModal\] = useState\(false\);\r?\n/, '');
 src = src.replace(/  const \[showAnalyticsModal, setShowAnalyticsModal\] = useState\(false\);\r?\n/, '');
 src = src.replace(/  const \[sidebarOpen, setSidebarOpen\] = useState\(false\);\r?\n/, '');
 src = src.replace(/  const isCheckInOpen = showCheckIn \|\| Boolean\(autoOpenCheckIn\);\r?\n/, '');
 src = src.replace(/  const handleCloseCheckIn = \(\) => \{\r?\n    setShowCheckIn\(false\);\r?\n    onAutoOpenCheckInHandled\?\.\(\);\r?\n  \};\r?\n/, '');

 // Remove DashboardSidebar
 src = src.replace(/        <DashboardSidebar[\s\S]*?setSidebarOpen=\{setSidebarOpen\}\r?\n        \/>\r?\n/m, '');

 src = src.replace(/setSidebarOpen\(true\)/g, 'onOpenSidebar()');
 src = src.replace(/setShowBookingModal\(true\)/g, 'onOpenBooking()');
 src = src.replace(/setShowAnalyticsModal\(true\)/g, 'onOpenAnalytics()');
 src = src.replace(/setShowCheckIn\(true\)/g, 'onOpenCheckIn()');

 // Remove modals at the end
 src = src.replace(/      <\/section>\r?\n    <\/div>\r?\n\r?\n    <CheckInModal[\s\S]*?\/>\r?\n  <\/div>\r?\n\)/m, '      </section>\r\n    </div>\r\n  </div>\r\n)');
 fs.writeFileSync('src/app/student/dashboard/_components/MindTab.tsx', src);
}

function updateBridgeTab() {
 let src = fs.readFileSync('src/app/student/dashboard/_components/BridgeTab.tsx', 'utf8');
 src = src.replace(/import \{ DashboardSidebar \} from "\.\/DashboardSidebar";\r?\n/, '');
 
 src = src.replace(
 '  activeTab: TabId;\n  setActiveTab: (tab: TabId) => void;\n}',
 `  activeTab: TabId;\n  setActiveTab: (tab: TabId) => void;\n  onOpenSidebar: () => void;\n  onOpenCheckIn: () => void;\n  onOpenBooking: () => void;\n  onOpenAnalytics: () => void;\n}`
 );

 src = src.replace(
 '  activeTab,\n  setActiveTab,\n}: BridgeTabProps',
 '  activeTab,\n  setActiveTab,\n  onOpenSidebar,\n  onOpenCheckIn,\n  onOpenBooking,\n  onOpenAnalytics,\n}: BridgeTabProps'
 );

 src = src.replace(/  const \[sidebarOpen, setSidebarOpen\] = useState\(false\);\r?\n/, '');

 src = src.replace(/        <DashboardSidebar[\s\S]*?setSidebarOpen=\{setSidebarOpen\}\r?\n        \/>\r?\n/m, '');

 src = src.replace(/onClick=\{\(\) => setSidebarOpen\(true\)\}/g, 'onClick={onOpenSidebar}');

 fs.writeFileSync('src/app/student/dashboard/_components/BridgeTab.tsx', src);
}

function updatePage() {
 let src = fs.readFileSync('src/app/student/dashboard/page.tsx', 'utf8');

 src = src.replace(
 "import { BridgeTab } from './_components/BridgeTab'",
 `import { BridgeTab } from './_components/BridgeTab'\nimport { DashboardSidebar } from './_components/DashboardSidebar'\nimport { CheckInModal } from './_components/CheckInModal'\nimport { BookingModal } from './_components/BookingModal'\nimport { AnalyticsModal } from './_components/AnalyticsModal'`
 );

 src = src.replace(
 "  const [sessionId, setSessionId] = useState('')",
 `  const [sessionId, setSessionId] = useState('')\n  const [showCheckIn, setShowCheckIn] = useState(false)\n  const [showBookingModal, setShowBookingModal] = useState(false)\n  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false)\n  const [sidebarOpen, setSidebarOpen] = useState(false)`
 );

 const newReturn = `  return (
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
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onSwitchToBridge={() => setActiveTab("bridge")}
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

 src = src.replace(/  return \([\s\S]*?<\/AnimatePresence>/, newReturn);
 fs.writeFileSync('src/app/student/dashboard/page.tsx', src);
}

try {
 updateMindTab();
 updateBridgeTab();
 updatePage();
 console.log('Successfully rewrote layout');
} catch (e) {
 console.error(e);
}
