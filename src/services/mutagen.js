import ActionDispatcher from '../utils/action-dispatcher';

export default class Client {
    constructor(url="ws://127.0.0.1:8081/synchronization", dispatcher=null) {
        this.dispatch = dispatcher || new ActionDispatcher()
        this.id = 1
        this.url = url;
        this.connected = false;
    }


    connect() {
        if (this.connected) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const websocket = new WebSocket(this.url)
            websocket.onopen = () => {
                this.connected = true;
                this.dispatch.dispatch('open');
                resolve();
            };

            this.pendding = {};
            websocket.onmessage = (event)  => {
                let { data } = event;
                data = JSON.parse(data)
                if (this.pendding[data.id]) {
                    this.pendding[data.id].resolve(data);
                }

                this.dispatch.dispatch(data.action, data);
            }

            websocket.onclose = () => {
                console.log("CLOSED")
            };

            websocket.onerror = reject;

            this.websocket = websocket
        });
    }

    sendMessage(action, data) {
        // eslint-disable-next-line no-plusplus
        const id = this.id++;
        this.websocket.send(JSON.stringify({
            action,
            id,
            data
        }))

        const prom = () => {
            let res;
            const p = new Promise(resolve => {
                res = resolve;
            });

            p.resolve = res;
            return p;
        }

        this.pendding[id] = prom();
        return this.pendding[id];
    }

    answer(answer) {
        return this.sendMessage('answer', answer);
    }

    create(creation) {
        return this.sendMessage('creation', creation)
    }

    pause(selections) {
        return this.sendMessage('pause', selections)
    }

    reset(selections) {
        return this.sendMessage('reset', selections)
    }

    flush(selections) {
        return this.sendMessage("flush", selections)
    }

    terminate(selections) {
        return this.sendMessage("terminate", selections)
    }
}

// async function test() {
//     let creation = {
//         "name": "mutagen-server-create1",
//         "labels": {
//             "created_by": "mutagen-server",
//             "owner": "raojinlin",
//         },
//         "paused": false,
//         "alpha": {
//             "path": "/tmp/mutagen_test"
//         },
//         "beta": {
//             "protocol": "ssh",
//             "user": "raojinlin",
//             "host":"192.168.31.111",
//             "port": 22,
//             "path": "/tmp/xxx_sync"
//         }
//     };

//     const client = new Client();
//     client.websocket.onopen = async function () {
//         const createResult = client.create(creation)
//         console.log(createResult);

//         const pausedResult = client.pause({name: 'mutagen-server-create1'})
//         console.log(pausedResult);
//         console.log(await client.sendMessage('list', {name: 'mutagen-server-create1'}));

//         const resumeResult = client.sendMessage('resume', {name: 'mutagen-server-create1'})
//         console.log(resumeResult);
//         console.log(await client.sendMessage('list', {name: 'mutagen-server-create1'}));

//         const resetResult = client.reset({name: 'mutagen-server-create1'})
//         console.log(resetResult);
//         console.log(await client.sendMessage('list', {name: 'mutagen-server-create1'}));

//         const terminateResult = client.terminate({name: 'mutagen-server-create1'})
//         console.log(terminateResult)
//         console.log(await client.sendMessage('list', {name: 'mutagen-server-create1'}));
//     }
// }