//default import
import Component from './base-component';
import * as Validation from '../utilities/validation';
import {autobind} from '../decorators/autobind';
import {projectState} from '../state/project-state';
//project input class
//redering the html elements using js/tsc
export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement>{
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
    renderContent() { };
    // the following methods are all private because they will only be executed within the class.
    //the purpose of this method is to seperate gathering input from our submit handler method and will return a [tuple (2)] or void
    //void is exclusive to functions, as opposed to undefined
    @autobind
    //return type is a tuple of type string, string, number... or just void if validation returns errors
    private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;

        const titleValidatble: Validation.Validateable = {
            value: enteredTitle,
            required: true
        }
        const descriptionValidatble: Validation.Validateable = {
            value: enteredDescription,
            required: true,
            minLength: 5
        }
        const peopleValidatble: Validation.Validateable = {
            value: +enteredPeople,
            required: true,
            min: 0,
            max: 15
        }
        if (
            //if dis or dis or dis is false, alert below and return void
            !Validation.validate(titleValidatble) ||
            !Validation.validate(descriptionValidatble) ||
            !Validation.validate(peopleValidatble)
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
        if (Array.isArray(userInput)) {
            //destructuring
            const [title, desc, people] = userInput;
            projectState.addProject(title, desc, people);
            console.log(title, desc, people);
            this.clearInputs();
        }
    }
}