import { Contact, ContactFieldType, Contacts } from '@ionic-native/contacts';

import { DeviceVariableService, IDeviceVariableOperation } from '@wm/variables';

export class ContactsService extends DeviceVariableService {
    public readonly name = 'contacts';
    public readonly operations: IDeviceVariableOperation[] = [];

    constructor(contacts: Contacts) {
        super();
        this.operations.push(new GetContactsOperation(contacts));
    }
}

class GetContactsOperation implements IDeviceVariableOperation {
    public readonly name = 'getContacts';
    public readonly model = {
        id : '',
        displayName : '',
        phoneNumbers : [{value: ''}]
    };
    public readonly properties = [
        {target: 'startUpdate', type: 'boolean'},
        {target: 'autoUpdate', type: 'boolean'},
        {target: 'contactFilter', type: 'string', value: '', dataBinding: true}
    ];
    public readonly requiredCordovaPlugins = ['CONTACTS'];

    public waitingCalls: (() => void)[] = [];

    constructor(private contacts: Contacts) {

    }

    private extractDisplayName(c: Contact): string {
        const name = c.displayName;
        // In IOS, displayName is undefined, so using the formatted name.
        if (!name || name === '') {
            if (c.name.formatted) {
                return c.name.formatted;
            }
        }
        return name;
    }

    private processNextCall() {
        if (this.waitingCalls.length > 0) {
            this.waitingCalls[0]();
        }
    }

    private findContacts(requiredFields, findOptions): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            // Contacts plugin is not processing two simultaneous calls. It is anwsering to only call.
            this.waitingCalls.push(() => {
                this.contacts.find(requiredFields, findOptions).then(data => {
                    if (data != null) {
                        const contacts = data.filter(c => {
                            c.displayName = this.extractDisplayName(c);
                            return c.phoneNumbers && c.phoneNumbers.length > 0;
                        });
                        resolve(contacts);
                    }
                }, reject).then(() => {
                    this.waitingCalls.shift();
                    this.processNextCall();
                });
            });
            if (this.waitingCalls.length === 1) {
                this.processNextCall();
            }
        });
    }

    public invoke(variable: any, options: any, dataBindings: Map<string, any>): Promise<any> {
        const requiredFields: ContactFieldType[] = ['displayName', 'name'];
        const findOptions = {
            filter : dataBindings.get('contactFilter'),
            multiple : true
        };
        return this.findContacts(requiredFields, findOptions);
    }
}