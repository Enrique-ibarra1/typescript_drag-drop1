
//Component base class
//<generics, t & u are identifiers>
export default abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;

    constructor(templateId: string, hostElementId: string, instertAtStart: boolean, newElementId?: string) {
        //selection the project-list <template>
        this.templateElement = <HTMLTemplateElement>document.getElementById(templateId)!;
        //host element is still the app <div>
        this.hostElement = document.getElementById(hostElementId)! as T;
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as U;
        //this elements id will be either 'active' or 'Finished'
        if (newElementId) {
            this.element.id = newElementId
        }
        this.attach(instertAtStart);
    }
    private attach(insertAtBeginning: boolean) {
        this.hostElement.insertAdjacentElement(insertAtBeginning ? 'afterbegin' : 'beforeend', this.element)
    };
    abstract configure?(): void;
    abstract renderContent(): void;
}