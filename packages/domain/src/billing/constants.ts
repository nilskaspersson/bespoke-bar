/** Must exceed the longest month (31d) so a mid-month count never undercounts. See ADR 0001. */
export const OCR_QUOTA_USE_RETENTION_DAYS = 35;

/** Base 3 + 47 = 50 OCRs/month while Pro is active. See ADR 0012. */
export const PRO_OCR_QUOTA_BONUS = 47;
export const PRO_SIGNUP_SLOT_BONUS = 100;
export const PRO_MONTHLY_SLOT_BONUS = 5;
