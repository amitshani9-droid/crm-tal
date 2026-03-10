/**
 * mockClients.js
 * Sample client data for development and testing.
 *
 * Field names MUST match the live SheetDB column names used by components:
 *   id, status, contact, phone, email, role, company, history, nextCall,
 *   documents, avatarIndex
 */
export const mockClients = [
  {
    id: String(Date.now() - 100000),
    status: "חדש",
    contact: "ישראל ישראלי",
    phone: "050-1234567",
    email: "israel@example.co.il",
    role: "מנכ״ל",
    company: "הייטק בע״מ",
    history: "שיחה ראשונית בוצעה. הלקוח מתעניין בשירות לפיתוח מערכת ניהול פנימית. ביקש הצעת מחיר עד יום חמישי.",
    nextCall: "2026-03-15T10:00",
    documents: [],
    avatarIndex: 1
  },
  {
    id: String(Date.now() - 200000),
    status: "בטיפול",
    contact: "שרה כהן",
    phone: "052-9876543",
    email: "sara.c@startup.io",
    role: "מנהלת שיווק",
    company: "סטארטאפ יוזמות",
    history: "שלחתי להם פרופיל חברה. צריכים לעבור על זה עם הדירקטוריון. לחזור אליהם שבוע הבא לבדיקת סטטוס.",
    nextCall: "2026-03-16T14:30",
    documents: [{ name: "Company_Profile.pdf", url: "#" }],
    avatarIndex: 2
  },
  {
    id: String(Date.now() - 300000),
    status: "סגור",
    contact: "דוד לוי",
    phone: "054-5556667",
    email: "david@david-law.com",
    role: "עורך דין שותף",
    company: "לוי ושות׳ משרד עורכי דין",
    history: "הלקוח סגר עסקה. יש לשלוח חשבונית מקדמה ולהתחיל בעבודה.",
    nextCall: "",
    documents: [
      { name: "Quote_Final.pdf", url: "#" },
      { name: "Signed_Contract.pdf", url: "#" }
    ],
    avatarIndex: 3
  }
];
