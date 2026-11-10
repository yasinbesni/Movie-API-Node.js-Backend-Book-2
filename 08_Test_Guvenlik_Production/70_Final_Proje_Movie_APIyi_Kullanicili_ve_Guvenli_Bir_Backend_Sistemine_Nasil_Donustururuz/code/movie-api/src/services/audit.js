import { AuditEvent } from "../db/models/auditEvent.js";
export const writeAuditEvent = ({ action, actorId, targetId, outcome }) => AuditEvent.create({ action, actorId, targetId, outcome });
