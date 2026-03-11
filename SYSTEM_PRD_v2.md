# AS-CRM: אפיון מערכת (PRD) - גרסה 3.0
> **סטטוס:** מעודכן לאחר נרמול בסיס הנתונים - מרץ 2026  
> **מקור אמת (Source of Truth):** מסמך זה משקף את המבנה העדכני של האפליקציה, ניהול הסטייט ומודל הנתונים המנורמל.

---

## 1. חזון המערכת
AS-CRM היא פלטפורמת ניהול לקוחות (CRM) מודרנית, קלה ומהירה המיועדת לעסקים קטנים ובינוניים. המערכת שמה דגש על חוויית משתמש (UX) בסטנדרט גבוה, אסתטיקה של "Glassmorphism", ומודל נתונים גמיש המאפשר התאמה אישית מלאה של תהליכי עבודה.

---

## 2. ארכיטקטורה וטכנולוגיה
### Stack טכנולוגי:
- **Frontend:** React 19 + Vite.
- **Routing:** React Router DOM v7.
- **Styling:** Vanilla CSS (CSS Variables) + Framer Motion לאנימציות.
- **Backend/DB:** Supabase (PostgreSQL, Auth, Storage, Edge Functions).

### ניהול סטייט ונתונים:
1. **AuthContext:** מנהל את הסשן של המשתמש, נתוני הפרופיל והגדרות המיתוג.
2. **OutletContext:** בשימוש בתוך `MainLayout`. מספק גישה גלובלית ל-`clients`, `stages`, ופונקציות Fetch. מונע כפילות קריאות ל-API.
3. **Optimistic UI:** עדכונים מיידיים ב-UI (כמו שינוי שלב ב-Pipeline) עם סנכרון רקע.

---

## 3. מבנה הניתוב (Routing)
- `/` - Landing Page / דף בית.
- `/login` / `/signup` - ניהול כניסה והרשמה.
- `/dashboard` - לוח בקרה ראשי עם Pipeline דינמי (מוגן).
- `/settings` - ניהול מיתוג ותהליכי עבודה (מוגן).
- `/admin` - לוח בקרה למנהל מערכת.
- `/טופס/:slug` - דף נחיתה ציבורי לאיסוף לידים.

---

## 4. מודל הנתונים המנורמל (Supabase Schema)

### טבלת `profiles`
- `id`: UUID (FK to Auth.users).
- `business_name`, `slug`, `settings` (JSONB).

### טבלת `pipeline_stages` (חדש)
- `id`: UUID (Primary Key).
- `user_id`: UUID (FK to Profiles).
- `name`: שם השלב (למשל: "חדש", "בטיפול").
- `position`: סדר התצוגה.
- `color`: צבע השלב (HEX).

### טבלת `clients` (מעודכן)
- `id`: UUID/Internal ID.
- `user_id`: UUID (FK to Profiles).
- `stage_id`: UUID (FK to pipeline_stages).
- `contact`, `phone`, `email`, `company`, `role`: פרטי הלקוח.
- `status`: (Legacy) סטטוס טקסטואלי לגיבוי.

### טבלת `client_logs`
- `id`, `client_id`, `note_content`, `created_at`.

### טבלת `client_tasks` (חדש)
- `id`, `client_id`, `title`, `due_date`, `completed`.

### טבלת `client_files`
- `id`, `client_id`, `file_name`, `file_url`, `created_at`.

---

## 5. רכיבי ליבה חדשים

### Pipeline דינמי (Dashboard)
- ה-Dashboard טוען את ה-Stages של המשתמש ובונה את לוח ה-Monday בהתאם.
- תמיכה מלאה בצבעים מותאמים אישית לכל שלב.
- סינון אוטומטי של "משימות להיום" בחלק העליון.

### ClientTasks (ניהול משימות)
- החלפת רכיב ה-NextCall הישן במערכת משימות מרובות (Todo List) לכל לקוח.
- תמיכה בסימון 'בוצע' ומחיקה.

### ניהול Pipeline ב-Settings
- ממשק Drag-and-edit לניהול שלבי העבודה.
- אפשרות לשנות שמות וצבעים של שלבים קיימים או להוסיף חדשים.

---

## 6. תשתית ו-Performance
- **נרמול נתונים:** מעבר מ-JSONB כבד (ב-Settings וב-Clients) לטבלאות יחסיות אמיתיות לשיפור הביצועים והחיפוש.
- **Onboarding:** יצירה אוטומטית של שלבי ברירת מחדל ("חדש", "בטיפול", "סגור") לכל משתמש חדש.

---

*מסמך זה מהווה תשתית לכל עבודת פיתוח עתידית במערכת.*
