/**
 * apiConfig.js
 * Central place for every API-related environment variable and derived header helpers.
 * Import individual named exports — never mutate the config object at runtime.
 */

// ---------------------------------------------------------------------------
// Config object (read-only snapshot of env vars at module load time)
// ---------------------------------------------------------------------------

export const apiConfig = Object.freeze({
    // baseUrl: process.env.API_BASE_URL ?? "",
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    endpoints: Object.freeze({
        fetchUserDetails: "/pnb/fetch/fetchById",
        reportsQuerySubmitUser:
            "https://api-dev-stage.iserveu.online/pnb/sb/reports/querysubmit_user",
        currentLanguage: "/pnb/isu_soundbox/user_api/current_language",
        fetchLanguage: "/pnb/isu_soundbox/lang/fetch_language",
        updateLanguage: "/pnb/isu_soundbox/lang/update_language",
        staticQr: "/pnb/merchant/qr_convert_to_base64",
        viewAllTickets: "/pnb/helpandsupport/viewAllTickets",
        createTicket: "/pnb/helpandsupport/createTicket",
        viewTicket: "/pnb/helpandsupport/viewTicket",
    }),
});
