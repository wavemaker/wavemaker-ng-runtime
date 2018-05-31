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

    public invoke(variable: any, options: any, dataBindings: Map<string, any>): Promise<any> {
        const requiredFields: ContactFieldType[] = ['displayName', 'name'];
        const findOptions = {
            filter : dataBindings.get('contactFilter'),
            multiple : true
        };
        return this.contacts.find(requiredFields, findOptions).then(data => {
            if (data != null) {
                return data.filter(c => {
                    c.displayName = this.extractDisplayName(c);
                    return c.phoneNumbers && c.phoneNumbers.length > 0;
                });
            }
        });
    }
}