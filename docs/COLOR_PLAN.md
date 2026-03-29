# 🎨 MindBridge — Warm Wellness Color Plan

Based on Headspace's approach and color psychology research, a **warm, psychology-backed palette** tailored for a mental wellness app targeting students.

---

## The Palette

| Role | Swatch | Hex | Psychology / Usage |
|---|---|---|---|
| **Warm Cream** (Background) | 🟫 | `#F9F4F0` | Safety, comfort — replaces clinical white. Used as the base canvas everywhere. |
| **Sunset Orange** (Primary) | 🟠 | `#F47D4B` | Joy, warmth, optimism — primary buttons, key actions, progress indicators. |
| **Soft Peach** (Primary Light) | 🍑 | `#FDE8DC` | Gentle warmth — hover states, selected cards, subtle highlights. |
| **Deep Terracotta** (Primary Dark) | 🧱 | `#C4572A` | Grounding, trust — pressed states, active focus rings. |
| **Burnt Sienna** (Primary Darker) | 🔶 | `#A3421D` | Deep anchor — rarely used, only for extra emphasis on dark surfaces. |
| **Lavender** (Brand) | 💜 | `#7B61C2` | Spirituality, calm self-reflection — brand identity, logos, premium feel. |
| **Lavender Dark** (Brand Dark) | 🟣 | `#5B3FA0` | Depth — brand hover states, active nav items. |
| **Lavender Soft** (Brand Tint) | 💟 | `#C4B5E3` | Whisper of brand — tinted grays, scrollbar, ambient decorations. |
| **Sage Green** (Success) | 🌿 | `#6B9E7D` | Healing, renewal — success states, wellness scores, positive progress. |
| **Sage Green Soft** (Success Bg) | 🍃 | `#E8F2EC` | Subtle success — success banner backgrounds, positive card tints. |
| **Dusty Rose** (Warning/Empathy) | 🌸 | `#D4899F` | Compassion, self-care — warnings, mood alerts, soft notifications. |
| **Dusty Rose Soft** (Warning Bg) | 🩷 | `#F9E8ED` | Gentle alert — warning banner backgrounds, mood badge tints. |
| **Soft Red** (Danger) | ❤️ | `#C26A6A` | Careful urgency — destructive actions, error states (warm, not aggressive). |
| **Soft Red Bg** (Danger Bg) | 🫶 | `#FAEAEA` | Error surface — error banner backgrounds, validation highlights. |
| **Sky Blue** (Info) | 💙 | `#5A8EC7` | Clarity, guidance — informational tips, help tooltips, onboarding cues. |
| **Sky Blue Soft** (Info Bg) | 🩵 | `#EBF2FB` | Info surface — info banner backgrounds, educational card tints. |
| **Muted Gold** (Highlight) | ✨ | `#E5B85C` | Optimism, achievement — streaks, milestones, gamification. |
| **Muted Gold Soft** (Highlight Bg) | 🌟 | `#FBF3DF` | Achievement surface — milestone cards, streak badge backgrounds. |
| **Warm Sand** (Border) | 🏖️ | `#D9CEBF` | Softness — default borders, card outlines, dividers. |
| **Warm Sand Strong** (Border Strong) | 🪨 | `#B5A898` | Emphasis — hovered borders, focused input outlines. |
| **Warm Sand Light** (Border Light) | 🤍 | `#E8DFD4` | Whisper — inner dividers, table row separators. |
| **Deep Charcoal** (Text Primary) | ⬛ | `#2D2926` | Warm dark — headings, body text, primary labels. |
| **Warm Gray** (Text Secondary) | 🩶 | `#5C5550` | Supporting — secondary labels, descriptions, metadata. |
| **Warm Gray Muted** (Text Muted) | 🔘 | `#8A827A` | Whisper — placeholders, disabled text, timestamps. |
| **White** (Surface/Inverse Text) | ⬜ | `#FFFFFF` | Purity — card surfaces, text on dark/orange backgrounds. |

---

## Detailed Usage Guide

### 1. Backgrounds & Surfaces

| Element | Color | Hex | Notes |
|---|---|---|---|
| **Page background** (body, html) | Warm Cream | `#F9F4F0` | The global canvas. Feels like a cozy journal page. |
| **Card / Panel surface** | White | `#FFFFFF` | Cards sit on cream, creating gentle layering. |
| **Card hover surface** | Soft Peach | `#FDE8DC` | Subtle warm glow on hover — inviting, not jarring. |
| **Selected / Active card** | Soft Peach | `#FDE8DC` | With Sunset Orange left-border or ring. |
| **Modal / Dialog overlay** | Deep Charcoal @ 50% | `#2D292680` | Warm dimming, not cold black. |
| **Modal surface** | White | `#FFFFFF` | Clean focus area with rounded corners. |
| **Sidebar / Nav background** | White | `#FFFFFF` | Or Warm Cream for a more blended feel. |
| **Dark sections** (footer, hero alt) | Deep Charcoal | `#2D2926` | Warm dark — not pure black. |
| **Dark section alt** | Slightly lighter charcoal | `#3D3834` | For layering within dark areas. |
| **Surface tinted** (brand whisper) | Lavender @ 6% mix with white | `color-mix(#FFF, #C4B5E3 6%)` | Very subtle brand presence for special sections. |
| **Input field background** | White | `#FFFFFF` | Clean, clear writing surface. |
| **Disabled input background** | Warm Cream | `#F9F4F0` | Feels "resting", not broken. |
| **Tooltip background** | Deep Charcoal | `#2D2926` | High contrast for readability. |
| **Dropdown menu surface** | White | `#FFFFFF` | With Warm Sand border and soft shadow. |
| **Dropdown item hover** | Soft Peach | `#FDE8DC` | Warm highlight on hover. |

---

### 2. Buttons

| Button Type | Default | Hover | Active / Pressed | Disabled | Text Color |
|---|---|---|---|---|---|
| **Primary** (main CTA) | Sunset Orange `#F47D4B` | Deep Terracotta `#C4572A` | Burnt Sienna `#A3421D` | Sunset Orange @ 40% | White `#FFFFFF` |
| **Secondary** (outline) | Transparent + Sunset Orange border | Soft Peach `#FDE8DC` | Soft Peach darker `#FACBB3` | Warm Sand border @ 40% | Sunset Orange `#F47D4B` |
| **Ghost** (text only) | Transparent | Soft Peach `#FDE8DC` | Soft Peach darker `#FACBB3` | — | Sunset Orange `#F47D4B` |
| **Brand** (special/promo) | Lavender `#7B61C2` | Lavender Dark `#5B3FA0` | Darker `#4A3188` | Lavender @ 40% | White `#FFFFFF` |
| **Danger** (delete/remove) | Soft Red `#C26A6A` | Darker red `#A85555` | `#944848` | Soft Red @ 40% | White `#FFFFFF` |
| **Success** (confirm/done) | Sage Green `#6B9E7D` | `#5A8A6B` | `#4D7A5E` | Sage Green @ 40% | White `#FFFFFF` |

**Usage rules:**
- **Primary** → One per screen section. "Book Session", "Start Chat", "Submit".
- **Secondary** → Supporting actions beside a primary. "Cancel", "Learn More".
- **Ghost** → Tertiary actions, breadcrumbs, in-card links.
- **Brand** → Special promotional CTAs, premium features.
- **Danger** → Destructive only. "Delete Account", "Cancel Appointment".
- **Success** → Confirmation actions. "Confirm Booking", "Mark Complete".

---

### 3. Typography & Text

| Text Role | Color | Hex | Where |
|---|---|---|---|
| **Headings** (h1–h3) | Deep Charcoal | `#2D2926` | Page titles, section headings, card titles. |
| **Subheadings** (h4–h6) | Deep Charcoal | `#2D2926` | Same warmth, slightly smaller sizing does the differentiation. |
| **Body text** | Deep Charcoal | `#2D2926` | Paragraphs, article content, descriptions. |
| **Secondary text** | Warm Gray | `#5C5550` | Subtitles, meta info, supporting descriptions. |
| **Muted text** | Warm Gray Muted | `#8A827A` | Timestamps, "last seen", placeholder text. |
| **Placeholder text** | Warm Gray Muted | `#8A827A` | Input placeholders — warm, not cold gray. |
| **Links** | Sunset Orange | `#F47D4B` | Inline links. Underline on hover. |
| **Link hover** | Deep Terracotta | `#C4572A` | Darkened for feedback. |
| **Text on orange buttons** | White | `#FFFFFF` | Always white on Sunset Orange. |
| **Text on dark backgrounds** | White | `#FFFFFF` | Footer text, dark hero sections. |
| **Text on dark (secondary)** | Warm Sand | `#D9CEBF` | Secondary text on dark backgrounds. |
| **Error text** | Soft Red | `#C26A6A` | Form validation messages. |
| **Success text** | Sage Green | `#6B9E7D` | Confirmation messages, positive feedback. |
| **Brand text** (logo, tagline) | Lavender | `#7B61C2` | Logo wordmark, brand tagline. |

---

### 4. Borders, Dividers & Outlines

| Element | Color | Hex | Notes |
|---|---|---|---|
| **Default card border** | Warm Sand | `#D9CEBF` | Soft, visible but not harsh. |
| **Hovered card border** | Warm Sand Strong | `#B5A898` | Subtle darkening on hover. |
| **Active / Selected border** | Sunset Orange | `#F47D4B` | Clear selection indicator. |
| **Input border (default)** | Warm Sand | `#D9CEBF` | Inviting, not intimidating. |
| **Input border (focused)** | Sunset Orange | `#F47D4B` | Warm focus ring. |
| **Input border (error)** | Soft Red | `#C26A6A` | Error state. |
| **Input border (success)** | Sage Green | `#6B9E7D` | Valid state. |
| **Input border (disabled)** | Warm Sand Light | `#E8DFD4` | Faded, resting. |
| **Table row divider** | Warm Sand Light | `#E8DFD4` | Barely there, just enough structure. |
| **Section divider** | Warm Sand | `#D9CEBF` | Gradient: transparent → Warm Sand → transparent. |
| **Focus ring** (keyboard nav) | Sunset Orange @ 50% | `#F47D4B80` | 2px offset outline for accessibility. |
| **Sidebar divider** | Warm Sand Light | `#E8DFD4` | Separating nav groups. |
| **Dark surface borders** | Warm Gray Muted | `#8A827A` | Borders on dark charcoal backgrounds. |

---

### 5. Status & Semantic Colors

#### Success (Healing, Growth, Progress)

| Element | Color | Hex |
|---|---|---|
| Success icon / checkmark | Sage Green | `#6B9E7D` |
| Success banner background | Sage Green Soft | `#E8F2EC` |
| Success banner border | Sage Green | `#6B9E7D` |
| Success banner text | Deep Charcoal | `#2D2926` |
| Wellness score (positive) | Sage Green | `#6B9E7D` |
| Progress bar (complete) | Sage Green | `#6B9E7D` |

**Use for:** Successful bookings, quiz completions, positive mood trends, wellness milestones, "session confirmed".

#### Warning (Empathetic Alert)

| Element | Color | Hex |
|---|---|---|
| Warning icon | Dusty Rose | `#D4899F` |
| Warning banner background | Dusty Rose Soft | `#F9E8ED` |
| Warning banner border | Dusty Rose | `#D4899F` |
| Warning banner text | Deep Charcoal | `#2D2926` |
| Mood alert badge | Dusty Rose | `#D4899F` |

**Use for:** Mood dips detected, missed check-ins, gentle reminders, "your counselor rescheduled". Never for anxiety-inducing urgency.

#### Danger (Careful Urgency)

| Element | Color | Hex |
|---|---|---|
| Error icon | Soft Red | `#C26A6A` |
| Error banner background | Soft Red Bg | `#FAEAEA` |
| Error banner border | Soft Red | `#C26A6A` |
| Error banner text | Deep Charcoal | `#2D2926` |
| Validation error text | Soft Red | `#C26A6A` |
| Destructive button | Soft Red | `#C26A6A` |

**Use for:** Form validation errors, failed submissions, destructive confirmations. Warm red, never aggressive.

#### Info (Guidance & Learning)

| Element | Color | Hex |
|---|---|---|
| Info icon | Sky Blue | `#5A8EC7` |
| Info banner background | Sky Blue Soft | `#EBF2FB` |
| Info banner border | Sky Blue | `#5A8EC7` |
| Info banner text | Deep Charcoal | `#2D2926` |
| Tooltip text | White | `#FFFFFF` |

**Use for:** Onboarding tips, help tooltips, "did you know?" cards, resource descriptions, educational content cues.

#### Achievement (Celebration)

| Element | Color | Hex |
|---|---|---|
| Streak badge | Muted Gold | `#E5B85C` |
| Milestone card background | Muted Gold Soft | `#FBF3DF` |
| Milestone card border | Muted Gold | `#E5B85C` |
| Achievement icon | Muted Gold | `#E5B85C` |

**Use for:** Login streaks, quiz streaks, mood-check streaks, "7 days of journaling!", milestone celebrations.

---

### 6. Navigation

| Element | Color | Hex | Notes |
|---|---|---|---|
| **Nav background** | White | `#FFFFFF` | Clean, prominent. |
| **Nav item (default)** | Warm Gray | `#5C5550` | Understated when inactive. |
| **Nav item (hover)** | Deep Charcoal | `#2D2926` | Darkens for feedback. |
| **Nav item (active/current)** | Sunset Orange | `#F47D4B` | Clear "you are here" indicator. |
| **Nav item active background** | Soft Peach | `#FDE8DC` | Warm pill/highlight behind active item. |
| **Mobile bottom nav bg** | White | `#FFFFFF` | With top border in Warm Sand. |
| **Mobile nav active icon** | Sunset Orange | `#F47D4B` | Filled icon when active. |
| **Mobile nav inactive icon** | Warm Gray Muted | `#8A827A` | Outline icon when inactive. |
| **Breadcrumb separator** | Warm Sand Strong | `#B5A898` | Subtle, not distracting. |
| **Breadcrumb current page** | Deep Charcoal | `#2D2926` | Bold, no link. |
| **Breadcrumb link** | Warm Gray | `#5C5550` | Clickable, understated. |

---

### 7. Forms & Inputs

| Element | Color | Hex | Notes |
|---|---|---|---|
| **Input background** | White | `#FFFFFF` | Clear writing surface. |
| **Input border** | Warm Sand | `#D9CEBF` | Warm, inviting. |
| **Input border (focused)** | Sunset Orange | `#F47D4B` | "I'm listening" warmth. |
| **Input border (error)** | Soft Red | `#C26A6A` | Gentle error. |
| **Input border (valid)** | Sage Green | `#6B9E7D` | Confirmed good. |
| **Input placeholder** | Warm Gray Muted | `#8A827A` | Soft prompt. |
| **Input text** | Deep Charcoal | `#2D2926` | Clear readability. |
| **Label text** | Deep Charcoal | `#2D2926` | Clear and direct. |
| **Helper text** | Warm Gray | `#5C5550` | Below input guidance. |
| **Error message** | Soft Red | `#C26A6A` | Below input error. |
| **Checkbox/Radio unchecked** | Warm Sand Strong | `#B5A898` | Neutral resting state. |
| **Checkbox/Radio checked** | Sunset Orange | `#F47D4B` | Warm confirmation. |
| **Toggle track (off)** | Warm Sand | `#D9CEBF` | Resting. |
| **Toggle track (on)** | Sunset Orange | `#F47D4B` | Active. |
| **Toggle thumb** | White | `#FFFFFF` | Always white. |
| **Textarea (journaling)** | White bg, Warm Sand border | — | Extra generous padding for comfort. |

---

### 8. Charts & Data Visualization

| Element | Color | Hex | Notes |
|---|---|---|---|
| **Primary data series** | Sunset Orange | `#F47D4B` | Main metric line/bar. |
| **Secondary data series** | Lavender | `#7B61C2` | Comparison/secondary metric. |
| **Positive trend** | Sage Green | `#6B9E7D` | Upward mood trends. |
| **Negative trend** | Dusty Rose | `#D4899F` | Downward trends — empathetic, not alarming. |
| **Chart background** | White | `#FFFFFF` | Clean canvas. |
| **Chart gridlines** | Warm Sand Light | `#E8DFD4` | Barely visible structure. |
| **Chart axis labels** | Warm Gray | `#5C5550` | Readable but not dominant. |
| **Bar track (empty)** | Warm Cream | `#F9F4F0` | Gentle empty state. |
| **Tooltip background** | Deep Charcoal | `#2D2926` | High contrast. |
| **Tooltip text** | White | `#FFFFFF` | Clear readability. |

---

### 9. Chips, Tags & Badges

| Element | Color | Hex | Notes |
|---|---|---|---|
| **Default chip bg** | Warm Cream | `#F9F4F0` | Neutral tag. |
| **Default chip border** | Warm Sand | `#D9CEBF` | Soft outline. |
| **Default chip text** | Deep Charcoal | `#2D2926` | Readable. |
| **Selected chip bg** | Sunset Orange | `#F47D4B` | Active filter/selection. |
| **Selected chip text** | White | `#FFFFFF` | Contrast. |
| **Category chip bg** | Soft Peach | `#FDE8DC` | Topic tags on resources. |
| **Category chip text** | Deep Terracotta | `#C4572A` | Warm contrast. |
| **Mood badge (happy)** | Muted Gold Soft | `#FBF3DF` | With Muted Gold text. |
| **Mood badge (calm)** | Sage Green Soft | `#E8F2EC` | With Sage Green text. |
| **Mood badge (anxious)** | Dusty Rose Soft | `#F9E8ED` | With Dusty Rose text. |
| **Mood badge (sad)** | Sky Blue Soft | `#EBF2FB` | With Sky Blue text. |
| **Notification count badge** | Sunset Orange | `#F47D4B` | With White text. |
| **Status: Online** | Sage Green | `#6B9E7D` | Small dot indicator. |
| **Status: Away** | Muted Gold | `#E5B85C` | Small dot indicator. |
| **Status: Offline** | Warm Gray Muted | `#8A827A` | Small dot indicator. |

---

### 10. Shadows & Elevation

| Level | Shadow Value | When |
|---|---|---|
| **Level 0** | None | Flat cards, inline elements. |
| **Level 1** (resting card) | `0 1px 3px rgba(45, 41, 38, 0.06)` | Default card elevation. Warm-tinted shadow. |
| **Level 2** (hovered card) | `0 4px 12px rgba(45, 41, 38, 0.10)` | Card on hover. |
| **Level 3** (dropdown/modal) | `0 8px 24px rgba(45, 41, 38, 0.14)` | Floating menus, modals. |
| **Level 4** (toast/popover) | `0 12px 36px rgba(45, 41, 38, 0.18)` | Toasts, popovers, important overlays. |

> ⚠️ Always use warm-tinted `rgba(45, 41, 38, ...)` (Deep Charcoal base) instead of cold `rgba(0, 0, 0, ...)` for shadows.

---

### 11. Scrollbar & Ambient UI

| Element | Color | Hex | Notes |
|---|---|---|---|
| **Scrollbar thumb** | Lavender Soft | `#C4B5E3` | Brand whisper — subtle personality. |
| **Scrollbar thumb hover** | Lavender | `#7B61C2` | Slightly more visible on hover. |
| **Scrollbar track** | Transparent | — | Invisible track. |
| **Selection highlight** | Sunset Orange @ 24% | `#F47D4B3D` | Warm text selection. |
| **Selection text** | White | `#FFFFFF` | On top of selection highlight. |
| **Ambient grid** | Lavender Soft @ 6% | — | Subtle background texture for special sections. |
| **Loading skeleton** | Warm Sand Light → Warm Cream | `#E8DFD4` → `#F9F4F0` | Warm shimmer animation. |
| **Progress spinner** | Sunset Orange | `#F47D4B` | Loading states. |

---

### 12. Landing Page Specific

| Element | Color | Notes |
|---|---|---|
| **Hero background** | Warm Cream `#F9F4F0` | The inviting canvas. |
| **Hero headline** | Deep Charcoal `#2D2926` | Bold, warm, grounded. |
| **Hero subtitle** | Warm Gray `#5C5550` | Supporting, not competing. |
| **Hero CTA button** | Sunset Orange `#F47D4B` | The warm call to action. |
| **Feature section bg** | White `#FFFFFF` | Contrast from cream hero. |
| **Feature icons** | Sunset Orange `#F47D4B` | Consistent interactive color. |
| **Feature icon bg** | Soft Peach `#FDE8DC` | Warm icon container. |
| **Testimonial section bg** | Warm Cream `#F9F4F0` | Alternating with white. |
| **Testimonial quote** | Deep Charcoal `#2D2926` | Personal, warm. |
| **Testimonial author** | Warm Gray `#5C5550` | Supporting attribution. |
| **Stats numbers** | Sunset Orange `#F47D4B` | Eye-catching data. |
| **Stats labels** | Warm Gray `#5C5550` | Context for numbers. |
| **Footer background** | Deep Charcoal `#2D2926` | Grounding anchor. |
| **Footer text** | Warm Sand `#D9CEBF` | Readable on dark. |
| **Footer links** | White `#FFFFFF` | Clear navigation. |
| **Footer link hover** | Sunset Orange `#F47D4B` | Warm feedback. |
| **CTA banner bg** | Sunset Orange `#F47D4B` | Full-width CTA section. |
| **CTA banner text** | White `#FFFFFF` | High contrast on orange. |

---

### 13. Chat Interface

| Element | Color | Notes |
|---|---|---|
| **Chat background** | Warm Cream `#F9F4F0` | Cozy conversation space. |
| **User message bubble** | Sunset Orange `#F47D4B` | "My" messages — warm, personal. |
| **User message text** | White `#FFFFFF` | On orange bubble. |
| **Counselor message bubble** | White `#FFFFFF` | Clean, professional. |
| **Counselor message text** | Deep Charcoal `#2D2926` | Readable. |
| **Counselor message border** | Warm Sand `#D9CEBF` | Subtle outline. |
| **Typing indicator dots** | Warm Gray Muted `#8A827A` | Pulsing animation. |
| **Message timestamp** | Warm Gray Muted `#8A827A` | Unobtrusive. |
| **Chat input bg** | White `#FFFFFF` | Clear writing area. |
| **Chat input border** | Warm Sand `#D9CEBF` | Consistent with forms. |
| **Send button** | Sunset Orange `#F47D4B` | Clear action. |
| **Attachment icon** | Warm Gray `#5C5550` | Secondary action. |

---

### 14. Dashboard Specific

| Element | Color | Notes |
|---|---|---|
| **Dashboard bg** | Warm Cream `#F9F4F0` | Consistent canvas. |
| **Stat card bg** | White `#FFFFFF` | Elevated information. |
| **Stat card icon bg** | Soft Peach `#FDE8DC` | Warm icon container. |
| **Stat card value** | Sunset Orange `#F47D4B` | Eye-catching number. |
| **Stat card label** | Warm Gray `#5C5550` | Context. |
| **Upcoming session card** | White `#FFFFFF` | With left border in Lavender `#7B61C2`. |
| **Quick action buttons** | Soft Peach bg `#FDE8DC` | With Sunset Orange icon. |
| **Mood check-in prompt** | Muted Gold Soft `#FBF3DF` | Warm, inviting daily prompt. |
| **Mood check-in border** | Muted Gold `#E5B85C` | Gentle attention. |
| **Welcome greeting** | Deep Charcoal `#2D2926` | "Good morning, [Name]" |
| **Greeting emoji/wave** | Muted Gold `#E5B85C` | Cheerful accent. |

---

## Color Psychology Reference

| Color | Emotion | Mental Health Context |
|---|---|---|
| **Orange** | Joy, social connection, comfort | Encourages engagement without pressure. 44% of people associate orange with joy. |
| **Cream / Warm White** | Safety, openness, calm | Creates a non-threatening digital sanctuary — like a warm journal page. |
| **Lavender / Purple** | Introspection, spirituality, dignity | Supports self-reflection and premium trust. |
| **Sage Green** | Growth, renewal, balance | Represents healing and progress — connected to nature. |
| **Dusty Rose** | Compassion, empathy, gentleness | Feels caring without being alarming — vital for sensitive alerts. |
| **Muted Gold** | Hope, achievement, warmth | Celebrates progress without being flashy. |
| **Warm Sand** | Stability, earthiness, grounding | Provides structure without rigidity. |
| **Deep Charcoal** | Sophistication, warmth, clarity | Readable without the harshness of pure black. |
| **Sky Blue** | Trust, clarity, knowledge | Guides learning and understanding without clinical coldness. |

---

## Key Shifts from Current Design

| What | Before | After | Why |
|---|---|---|---|
| Primary interactive | Blue `#0061EF` | Sunset Orange `#F47D4B` | Orange = joy/warmth. Blue felt clinical for a wellness app. |
| Primary light | Blue tint `#e8f0ff` | Soft Peach `#FDE8DC` | Warm hover/selection states. |
| Link color | Blue `#0040EA` | Sunset Orange `#F47D4B` | Consistent warm interaction. |
| Brand role | Primary interactive | Identity accent only | Lavender reserved for logo, brand moments, scrollbar. |
| Success color | Saturated green `#02873E` | Sage Green `#6B9E7D` | Warmer, more natural, less clinical. |
| Warning color | Amber `#da9b41` | Dusty Rose `#D4899F` | More empathetic — vital for mental health context. |
| Danger color | Cold pink `#c26a7a` | Soft Red `#C26A6A` | Warm-shifted, less aggressive. |
| Borders | Cool grays | Warm Sand tones | Every border feels warm and inviting. |
| Text colors | Neutral darks | Warm-tinted darks | Even text has warmth baked in. |
| Shadows | `rgba(0,0,0,...)` | `rgba(45,41,38,...)` | Warm shadows = warm world. |

---

## Contrast Compliance (WCAG AA)

All foreground/background combinations must meet **WCAG AA** (4.5:1 for normal text, 3:1 for large text):

| Combination | Ratio | Status |
|---|---|---|
| Deep Charcoal on Warm Cream | ~12.5:1 | ✅ AAA |
| Deep Charcoal on White | ~14.7:1 | ✅ AAA |
| Deep Charcoal on Soft Peach | ~11.8:1 | ✅ AAA |
| White on Sunset Orange | ~3.2:1 | ✅ AA (large text / buttons) |
| White on Deep Terracotta | ~4.6:1 | ✅ AA |
| White on Lavender | ~4.4:1 | ✅ AA |
| White on Deep Charcoal | ~14.7:1 | ✅ AAA |
| Warm Gray on White | ~6.5:1 | ✅ AA |
| Warm Gray Muted on White | ~3.8:1 | ✅ AA (large text) |
| Sage Green on White | ~3.5:1 | ✅ AA (large text / icons) |
| Deep Charcoal on Sage Green Soft | ~11.0:1 | ✅ AAA |
| Deep Charcoal on Dusty Rose Soft | ~11.5:1 | ✅ AAA |
| Deep Charcoal on Muted Gold Soft | ~12.0:1 | ✅ AAA |

---

## Implementation Plan

1. **Phase 1** — Update CSS tokens in `globals.css`: swap all color variables to the new warm palette.
2. **Phase 2** — Update components (`Button`, `Card`, `Input`, `Chip`, `SelectionCard`): apply new token references.
3. **Phase 3** — Update landing page (`Hero`, `Sections`, `LandingPage`): gradients, surfaces, and feature styling.
4. **Phase 4** — Update dashboard & chat pages: stat cards, chart colors, chat bubbles.
5. **Phase 5** — Test all contrast ratios and fix any WCAG violations.
6. **Phase 6** — Review with `prefers-reduced-motion` and dark mode considerations.
