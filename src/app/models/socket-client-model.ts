export interface SocketClient {
    clientId?: string;
    type?: string;
    room?: string;
    user?: string;
    message?: string;
    file?: any;
    event?: string;
    action?: string;
}