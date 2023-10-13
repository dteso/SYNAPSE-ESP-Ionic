export class DeviceActionUtils {

    static DEVICE_ACTION_BUTTONS = [
        {
            caption: 'NORMAL',
            value: 'N',
            color: 'rgb(2, 188, 141)',
            // background: '#151c22',
            icon: 'heart-outline'
        },
        {
            caption: 'ANULAD0',
            value: 'B',
            color: '#555555',
            // background: '#151c22',
            icon: 'notifications-off-outline'
        }, {
            caption: 'CUARENTENA',
            value: 'Q',
            color: 'rgb(250, 211, 55)',
            // background: '#151c22',
            icon: 'nuclear'
        }, {
            caption: 'BLOQUEADO',
            value: 'L',
            color: 'brown',
            // background: '#151c22',
            icon: 'key-outline'
        }, {
            caption: 'TEST',
            value: 'M',
            color: 'rgb(244, 126, 246) ',
            // background: '#151c22',
            icon: 'hammer-outline'
        },
        {
            caption: 'BORRAR',
            value: 'D',
            color: 'rgb(233, 103, 103)',
            // background: '#151c22',
            icon: 'trash-outline'
        }
    ]

    static BYPASS_DEVICE_TITLE = "Anular dispositivo";
    static BYPASS_DEVICE_MSG = "Al anular dispositivo, este dejará de detectar y notitficar cualquier cambio en su estado.";
    static BYPASS_DEVICE_BUTTONS = [{
        caption: 'Anular',
        value: 'B',
        color: 'black',
        background: 'gray',
    },
    {
        caption: 'Cancelar',
        value: null,
        color: '#FFFFFF',
        background: 'rgb(233, 103, 103)',
    }];


    static TO_QUARENTINE_TITLE = "Poner en cuarentena";
    static TO_QUARENTINE_MSG = "Si pone un dispositivo en cuarentena podrá seguir viendo su estado y el dispositivo seguirá detectando pero se le emitirán notificaciones ante cambios.";
    static TO_QUARENTINE_BUTTONS = [{
        caption: 'Cuarentena',
        value: 'Q',
        color: '#FFFFFF',
        background: 'rgb(250, 211, 55)',
    },
    {
        caption: 'Cancelar',
        value: null,
        color: '#FFFFFF',
        background: 'rgb(233, 103, 103)',
    }];


    static LOCK_DEVICE_TITLE = "Bloquear dispositivo";
    static LOCK_DEVICE_MSG = "Si bloquea el dispositivo este se mantendrá siemplemente escuchando tus soliocitudes sin realizar operación adicional alguna. No podrá ver el estado del dispositivo y el reloj interno no se acrtivará.";
    static LOCK_DEVICE_BUTTONS = [{
        caption: 'Bloquear',
        value: 'K',
        color: '#FFFFFF',
        background: 'rgb(250, 211, 55)',
    },
    {
        caption: 'Cancelar',
        value: null,
        color: '#FFFFFF',
        background: 'rgb(233, 103, 103)',
    }];


    static RESTORE_DEVICE_TITLE = "Restaurar dispositivo";
    static RESTORE_DEVICE_MSG = "Se solicitará al dispositivo funcionar normalmente. Controlará cambios de entradas, estado y serás notificado cuando corresponda.";
    static RESTORE_DEVICE_BUTTONS = [{
        caption: 'Restaurar',
        value: 'N',
        color: '#FFFFFF',
        background: 'lightgreen',
    },
    {
        caption: 'Cancelar',
        value: null,
        color: '#FFFFFF',
        background: 'rgb(233, 103, 103)',
    }];


    static DELETE_DEVICE_TITLE = "Borrar dispositivo";
    static DELETE_DEVICE_MSG = 'Confirma que desea borrar el dispositivo? Recuerde que en caso de querer grabarlo de nuevo deberá hacerlo desde la propia instalación donde se encuentre el dispositivo.';
    static DELETE_DEVICE_BUTTONS = [{
        caption: 'Borrar',
        value: 'D',
        color: '#FFFFFF',
        background: 'lightgreen',
    },
    {
        caption: 'Cancelar',
        value: null,
        color: '#FFFFFF',
        background: 'rgb(233, 103, 103)',
    }];



}
