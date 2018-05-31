function* idGenerator(token) {
    let id = 1;
    while (1) {
        yield `${token}${id++}`;
    }
}

export class IDGenerator {
    private generator: Iterator<any>;

    constructor(key: string) {
        this.generator = idGenerator(key);
    }

    public nextUid(): string {
        return this.generator.next().value;
    }
}
