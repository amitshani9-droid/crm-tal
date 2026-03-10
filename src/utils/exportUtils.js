/**
 * exportUtils.js
 * Shared utility for exporting CRM client data to CSV.
 */

/**
 * Exports an array of client objects to a CSV file download.
 * @param {Array} clients - The list of client objects.
 * @param {string} [filename] - Optional custom filename (without extension).
 */
export function exportClientsToCSV(clients, filename) {
    if (!clients || clients.length === 0) {
        alert("אין נתונים לייצוא.");
        return;
    }

    const headers = "ID,סטטוס,איש קשר,טלפון,מייל,תפקיד,חברה,היסטוריית שיחות,שיחה הבאה\n";
    const rows = clients.map(c => {
        const history = (c.history || "").replace(/"/g, '""');
        const contact = (c.contact || "").replace(/"/g, '""');
        const company = (c.company || "").replace(/"/g, '""');
        const role = (c.role || "").replace(/"/g, '""');
        const phone = (c.phone || "").startsWith("'") ? c.phone.substring(1) : (c.phone || "");

        return `"${c.id}","${c.status || 'חדש'}","${contact}","${phone}","${c.email || ''}","${role}","${company}","${history}","${c.nextCall || ''}"`;
    }).join("\n");

    const csvContent = "\ufeff" + headers + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename || 'CRM_Export'}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    // Revoke the object URL after the click to free memory
    setTimeout(() => URL.revokeObjectURL(link.href), 100);
}
