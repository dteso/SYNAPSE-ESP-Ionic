import { Client } from "./client.model";

export interface Device {
    uid: string;
    clientId?: string;
    ip?: string;
    MAC?: string;
    type?: string;
    name?: string;
    rssi?: string;
    ssid?: string;
    status?: any;
    temp?: string;
    hum?: string;
    minLevelReached?: string;
    customer: Client;
    lastRefill: any;
    lastEvent: any;
    appKey?: any;
    mode?: any;
}
