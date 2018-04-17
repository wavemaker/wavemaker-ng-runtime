function* idMaker(token) {
    let id = 1;
    while (1) {
        yield `${token}${id++}`;
    }
}

export class IDGenerator {
    private generator: Iterator;

    constructor(private key: string) {
        this.generator = idMaker(key);
    }

    public nextUid(): string {
        return this.generator.next().value;
    }
}
