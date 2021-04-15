//drag & drop interfaces
interface Draggable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
}

interface DragTarget{
    //permits the drop to hover over target
    dragOverHandler(event: DragEvent): void;
    //allows drop logic
    dropHandler(event: DragEvent): void;
    //reverting visual update
    dragLeaveHandler(event: DragEvent): void;
}

//Project type
enum ProjectStatus {Active, Finished}

class Project {
    constructor(
        public id: string, 
        public title: string, 
        public description: string, 
        public people: number, 
        public status: ProjectStatus ){}
}

type Listener<T> = (items: T[]) => void;

class State<T> {
    //this will be any array of listener functions looking for changes
    protected listeners: Listener<T>[] = [];
    addListener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn)
    }
}

//Project State Management, similar to other state management in libraries/frameworks
class ProjectState extends State<Project> {
    private projects: Project[] = [];
    private static instance: ProjectState;
    private constructor () {
        super();
    }
    //ensuring only one instance of state is created and used, if not make one.
    static getInstance() {
        if(this.instance) {
            return this.instance
        }
        this.instance = new ProjectState();
        return this.instance;
    }
    addProject(title: string, description: string, numOfPeople: number) {
        const newProject = new Project(Math.random.toString(), title, description, numOfPeople, ProjectStatus.Active)
        this.projects.push(newProject);
        this.updateListeners();
    }

    moveProject(projectId: string, newStatus: ProjectStatus) {
        const proj = this.projects.find(prj => prj.id === projectId);
        if (proj) {
            proj.status  = newStatus;
            this.updateListeners();
        }
    }
    private updateListeners(){
        for(const listenerFn of this.listeners) {
            //slice is to return a copy of the original array
            listenerFn(this.projects.slice());
        }
    }
}
//create state
const projectState = ProjectState.getInstance();
//autobind decorator
// _ would normally be target, _2 would be methodname. these are hints to the tsc compiler that there is no need to use them, but are mandatory for the method
//this behavior can be turned off in the tsconfig settings.
function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
    //storing our method
    const originalMethod = descriptor.value;
    //this object 
    const adjDescriptor: PropertyDescriptor = {
        //setting this to true means we can always change it
        configurable: true,
        //this getter is executed when we try to access the function
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    };
    return adjDescriptor;
}

//validation Logic
//this interface will extend to the Validate function
interface Validateable {
    //these are the properties we want to support in our validation
    //optional? the ? is the same as defnining it as a type | undefined
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

function validate(validatableInput: Validateable) {
    //the default assumption is that the data we all receive is truthy, will be changed later
    let isValid = true;
    if (validatableInput.required) {
        //if user input value length is not 0
        isValid = isValid && validatableInput.value.toString().trim().length !== 0;
    }
    //if our input is a string 
    //!= one equals sign means we include null and undefined into our comparison
    if (validatableInput.minLength != null && typeof validatableInput.value === 'string') {
        //if the inputs value's (string) length is greater than our defined minLength
        isValid = isValid && validatableInput.value.length > validatableInput.minLength;
    }
    if (validatableInput.maxLength != null && typeof validatableInput.value === 'string') {
        //if the inputs value's (string) length is less than our defined maxLength
        isValid = isValid && validatableInput.value.length < validatableInput.maxLength;
    }
    if (validatableInput.min != null && typeof validatableInput.value === 'number') {
        isValid = isValid && validatableInput.value > validatableInput.min
    }
    if (validatableInput.max != null && typeof validatableInput.value === 'number') {
        isValid = isValid && validatableInput.value < validatableInput.max
    }
    return isValid
}

//Component base class
//<generics, t & u are identifiers>
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;

    constructor(templateId: string, hostElementId: string, instertAtStart: boolean, newElementId?: string ) {
        //selection the project-list <template>
        this.templateElement = <HTMLTemplateElement>document.getElementById(templateId)!; 
        //host element is still the app <div>
        this.hostElement = document.getElementById(hostElementId)! as T;
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as U;
        //this elements id will be either 'active' or 'Finished'
        if(newElementId) {
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

//projectItem class
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
    private project: Project;
    get persons() {
        if (this.project.people === 1) {
            return '1 person';
        } else {
            return `${this.project.people} people`
        }
    }
    constructor(hostId: string, project: Project) {
        super('single-project', hostId, false, project.id);
        this.project = project
        this.configure();
        this.renderContent();
    }
    @autobind
    dragStartHandler(event: DragEvent){
        event.dataTransfer!.setData('text/plain', this.project.id);
        event.dataTransfer!.effectAllowed = 'move';
    }

    dragEndHandler(_: DragEvent) {
        console.log('drag end')
    }
    configure(){
        this.element.addEventListener('dragstart', this.dragStartHandler);
        this.element.addEventListener('dragstart', this.dragEndHandler);
    }
    renderContent(){
        this.element.querySelector('h2')!.textContent = this.project.title;
        this.element.querySelector('h3')!.textContent = this.persons + ' assigned'
        this.element.querySelector('p')!.textContent = this.project.description;
    }
}

//projectList class
class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
    assignedProjects: Project[];

    constructor(private type: 'active' | 'finished'){
        super('project-list', 'app', false ,`${type}-projects`);
        this.assignedProjects = [];
        this.configure();
        this.renderContent();
    }
    @autobind
    dragOverHandler(event: DragEvent) {
        if(event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
            event.preventDefault();
            const listEl = this.element.querySelector('ul')!;
            listEl.classList.add('droppable');
        }
    }
    @autobind
    dropHandler(event: DragEvent) {
        const projectId = event.dataTransfer!.getData('text/plain');
        projectState.moveProject(projectId, this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished);
    }

    @autobind
    dragLeaveHandler(_: DragEvent){
        const listEl = this.element.querySelector('ul');
        listEl?.classList.remove('droppable');
    }
    configure(){
        this.element.addEventListener('dragover', this.dragOverHandler);
        this.element.addEventListener('dragleave', this.dragLeaveHandler);
        this.element.addEventListener('drop', this.dropHandler);
        projectState.addListener((projects: Project[])  => {
            const relevantProjects = projects.filter(project => {
                if (this.type === 'active'){
                    return project.status === ProjectStatus.Active
                }
                return project.status === ProjectStatus.Finished;
            })
            this.assignedProjects = relevantProjects;
            this.renderProjects();
        });
    };
    renderContent() {
        //choosing between our active or finished lists
        const listId = `${this.type}-project-list`;
        //setting the id of the <ul> as either finished or active
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toLocaleUpperCase() + ' PROJECTS';
    }
    private renderProjects() {
        const listEl = document.getElementById(`${this.type}-project-list`)! as HTMLUListElement;
        //every time this function is called, our fields are cleared 
        listEl.innerHTML = '';
        for (const projectItem of this.assignedProjects) {
            new ProjectItem(this.element.querySelector('ul')!.id, projectItem);
        }
    }
} 

//project input class
//redering the html elements using js/tsc
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement>{
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        super('project-input', 'app', true, 'user-input')
        this.titleInputElement = <HTMLInputElement>this.element.querySelector('#title');
        this.descriptionInputElement = <HTMLInputElement>this.element.querySelector('#description');
        this.peopleInputElement = <HTMLInputElement>this.element.querySelector('#people');
        this.configure();
    }
    configure() {
        this.element.addEventListener('submit', this.submitHandler)
    }
    renderContent(){};
    // the following methods are all private because they will only be executed within the class.
    //the purpose of this method is to seperate gathering input from our submit handler method and will return a [tuple (2)] or void
    //void is exclusive to functions, as opposed to undefined
    @autobind
    //return type is a tuple of type string, string, number... or just void if validation returns errors
    private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;

        const titleValidatble: Validateable = {
            value: enteredTitle,
            required: true
        }
        const descriptionValidatble: Validateable = {
            value: enteredDescription,
            required: true,
            minLength: 5
        }
        const peopleValidatble: Validateable = {
            value: +enteredPeople,
            required: true,
            min: 0,
            max: 15
        }
        if (
            //if dis or dis or dis is false, alert below and return void
            !validate(titleValidatble) ||
            !validate(descriptionValidatble) ||
            !validate(peopleValidatble)
        ) {
            //here is where void would be returned, add error handling later
            alert('invalid input, figure it out');
            return;
        } else {
            //if user input is clean, return the tuple of string string, +text to numbner/parseFloat(enteredPeople)
            return [enteredTitle, enteredDescription, +enteredPeople]
        }
    }
    //clearing the text entered into our forms at the end of the submit handler
    private clearInputs() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }

    @autobind
    private submitHandler(event: Event) {
        event.preventDefault();
        const userInput = this.gatherUserInput();
        //checking if the line above returns a tuple
        //since there are no tuples in JS, so the Array object gives functinality here.
        if(Array.isArray(userInput)) {
            //destructuring
            const [title, desc, people] = userInput;
            projectState.addProject(title, desc, people);
            console.log(title, desc, people);
            this.clearInputs();
        }
    }
}

const prjInput = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');