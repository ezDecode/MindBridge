const fs = require('fs');
let content = fs.readFileSync('src/app/student/dashboard/_components/MindTab.tsx', 'utf8');

// imports
content = content.replace(/import { CheckInModal } from ".\/CheckInModal";\r?\n/g, '');
content = content.replace(/import { BookingModal } from ".\/BookingModal";\r?\n/g, '');
content = content.replace(/import { AnalyticsModal } from ".\/AnalyticsModal";\r?\n/g, '');
content = content.replace(/import { DashboardSidebar } from ".\/DashboardSidebar";\r?\n/g, '');

// interface
content = content.replace(
  ' activeTab: TabId;\n setActiveTab: (tab: TabId) => void;\n}',
   activeTab: TabId;
 setActiveTab: (tab: TabId) => void;
 onOpenSidebar: () => void;
 onOpenCheckIn: () => void;
 onOpenBooking: () => void;
 onOpenAnalytics: () => void;
}
);

// props destruct
content = content.replace(
  ' activeTab,\n setActiveTab,\n}: MindTabProps',
  ' activeTab,\n setActiveTab,\n onOpenSidebar,\n onOpenCheckIn,\n onOpenBooking,\n onOpenAnalytics,\n}: MindTabProps'
);

// states
content = content.replace(/ const \[showCheckIn[\s\S]*?\] = useState\(false\);\r?\n/, '');
content = content.replace(/ const \[showBookingModal[\s\S]*?\] = useState\(false\);\r?\n/, '');
content = content.replace(/ const \[showAnalyticsModal[\s\S]*?\] = useState\(false\);\r?\n/, '');
content = content.replace(/ const \[sidebarOpen[\s\S]*?\] = useState\(false\);\r?\n/, '');

content = content.replace(/ const isCheckInOpen = showCheckIn \|\| Boolean\(autoOpenCheckIn\);\r?\n/, '');
content = content.replace(/ const handleCloseCheckIn = \(\) => \{\r?\n setShowCheckIn\(false\);\r?\n onAutoOpenCheckInHandled\?\.\(\);\r?\n \};\r?\n/, '');

// JSX
content = content.replace(/ <div className="flex h-full min-h-0 bg-\[var\(--color-surface-tinted\)\] lg:bg-\[var\(--color-background\)\]">\r?\n <DashboardSidebar[\s\S]*?sidebarOpen={sidebarOpen}\r?\n setSidebarOpen={setSidebarOpen}\r?\n \/>(\r?\n)+ {\/\* Main Content Area \*\/}\r?\n/, '');

content = content.replace(/setSidebarOpen\(true\)/g, 'onOpenSidebar()');
content = content.replace(/setShowBookingModal\(true\)/g, 'onOpenBooking()');
content = content.replace(/setShowAnalyticsModal\(true\)/g, 'onOpenAnalytics()');
content = content.replace(/setShowCheckIn\(true\)/g, 'onOpenCheckIn()');

content = content.replace(/ <\/div>\r?\n <\/section>\r?\n <\/div>\r?\n\r?\n <CheckInModal[\s\S]*/, ' </section>\r?\n </>\r?\n);\r?\n}');

fs.writeFileSync('src/app/student/dashboard/_components/MindTab.tsx', content);
console.log('Done mindtab');
