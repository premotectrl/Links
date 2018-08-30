import { fillHostname } from "../utils/apiUtilities.js";

export const SAFETY_STATES = [
    'SAFE',
    'WARNING_FIELD',
    'PROTECTIVE_STOP',
    'ACKNOWLEDGE_REQUIRED',
    'EMERGENCY_STOP',
];

export const KPIS = [
    'mr-commandability-COMMANDABLE',
    'mr-commandability-TEMPORARILY_NOT_COMMANDABLE',
    'mr-commandability-NOT_COMMANDABLE',

    'mr-connection-CONNECTED',
    'mr-connection-UNRELIABLE',
    'mr-connection-DISCONNECTED',
    'mr-connection-DISPOSED',
    // There is no kpi for unknown so this must be computed from the other connection kpi values
    // 'mr-connection-UNKNOWN',

    'mr-pose-reliability-RELIABLE',
    'mr-pose-reliability-UNDECIDED',
    'mr-pose-reliability-UNRELIABLE',
];


export const ENDPOINTS = {
    getHistoricalKpi: fillHostname('https://{hostname}/api/v1/kpi/historical/{kpi}/devices/{asset_id}'),
    getScalarKpi: fillHostname('https://{hostname}/api/v1/kpi/scalar:search'),
};