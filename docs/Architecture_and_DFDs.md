# MindBridge System Architecture & DFDs

Here are the Mermaid diagrams representing the architecture, data flow, and database models used in MindBridge. You can copy these code blocks into [diagrams.net (Draw.io)](https://app.diagrams.net/) or any Mermaid live editor.

## 1. Data Collection (DFD Level 0)
*How we collect data from the student and process it through the system.*

```mermaid
graph TD
    Student[Student User] -->|Sends Messages / Mood| Frontend[MindBridge Next.js Frontend]
    Frontend -->|API Requests| NextAPI[Next.js API Routes]
    NextAPI -->|Saves Raw Chat Logs| DB[(Supabase PostgreSQL)]
    NextAPI -->|Evaluates Risk/Sentiment| AI[Companion Agent / LLaMA 3]
    AI -->|Structured Assessment| NextAPI
    NextAPI -->|Updates Profile & Triggers| DB
    DB -->|Alerts & Dashboards| Counselor[Counselor / Admin]
```

## 2. Chatbot Architecture
*The internal mechanism of the Companion Agent processing a message.*

```mermaid
flowchart LR
    User[User Message] --> MemoryAgent[Memory Agent]
    DB[(Supabase)] -->|Previous Chats & Moods| MemoryAgent
    MemoryAgent -->|Context Summary| Companion[Companion Agent LLM]
    User --> Companion
    Companion -->|Generates Response| ActionAgent[Action Agent]
    Companion -->|Evaluates Intent| ActionAgent
    ActionAgent -->|Normal Chat| ChatUI[Send to User]
    ActionAgent -->|Books Appointment| Booking[Booking System]
    ActionAgent -->|Crisis Detected| Alert[Crisis Alert System]
```

## 3. Overall Application Architecture
*A high-level view of all the building blocks working together.*

```mermaid
architecture-beta
    group frontend(cloud)[Frontend Application]
    service nextjs(server)[Next.js App Router] in frontend
    service ui(server)[React/Tailwind UI] in frontend
    
    group backend(cloud)[Backend & Database]
    service supabase(database)[Supabase Services] in backend
    service postgres(database)[PostgreSQL + pgvector] in backend
    service edge(server)[Edge Functions] in backend
    
    group ai(cloud)[AI Engine]
    service nim(server)[NVIDIA NIM APIs] in ai
    service llama(server)[LLaMA 3 Models] in ai
    
    ui --> nextjs
    nextjs --> supabase
    supabase --> postgres
    nextjs --> nim
    edge --> postgres
    nim --> llama
```

## 4. Use-Case Diagram
*The main actors and what they can do.*

```mermaid
flowchart LR
    subgraph MindBridge System
        Chat[Chat with Companion]
        LogMood[Log Daily Mood]
        Book[Book Appointment]
        ViewDashboard[View Student Progress]
        ManageSlots[Manage Availability]
        ReceiveAlerts[Receive Crisis Alerts]
        SystemMetrics[View System Analytics]
    end

    Student((Student)) --> Chat
    Student((Student)) --> LogMood
    Student((Student)) --> Book

    Counselor((Counselor)) --> ViewDashboard
    Counselor((Counselor)) --> ManageSlots
    Counselor((Counselor)) --> ReceiveAlerts

    Admin((Admin)) --> SystemMetrics
    Admin((Admin)) --> ViewDashboard
```

## 5. Appointment Booking & Counselor Flow
*How a student connects with a counselor through the AI.*

```mermaid
sequenceDiagram
    actor Student
    participant AI as Companion Agent
    participant DB as Supabase
    actor Counselor
    
    Student->>AI: "I think I need to talk to someone"
    AI->>DB: Check available counselor slots
    DB-->>AI: Returns available slots
    AI->>Student: Suggests a time (e.g., "Tomorrow at 2 PM?")
    Student->>AI: "Yes, that works"
    AI->>DB: Creates Booking (Pending)
    DB-->>Counselor: Dashboard Notification: New Booking
    Counselor->>DB: Confirms Booking
    DB-->>Student: Appointment Confirmed
```

## 6. Entity Relationship (ER) Diagram
*Database schema overview (Level 1).*

```mermaid
erDiagram
    PROFILES ||--o{ MOOD_LOGS : "logs"
    PROFILES ||--o{ CHAT_SESSIONS : "owns"
    PROFILES ||--o{ COUNSELOR_SLOTS : "manages"
    PROFILES ||--o{ BOOKINGS : "makes/receives"
    CHAT_SESSIONS ||--o{ CHAT_MESSAGES : "contains"
    
    PROFILES {
        uuid id PK
        string name
        string role "student, counselor, admin"
        uuid counselor_id FK
    }
    
    MOOD_LOGS {
        uuid id PK
        uuid user_id FK
        int score
        string note
        datetime logged_at
    }

    CHAT_MESSAGES {
        uuid id PK
        uuid session_id FK
        string role "user or assistant"
        string content
        boolean crisis_flag
    }
    
    BOOKINGS {
        uuid id PK
        uuid student_id FK
        uuid counselor_id FK
        datetime slot_start
        string status
    }
```