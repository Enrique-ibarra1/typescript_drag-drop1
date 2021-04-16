import {Project, ProjectStatus} from '../models/project.js';
type Listener<T> = (items: T[]) => void;

class State<T> {
    //this will be any array of listener functions looking for changes
    protected listeners: Listener<T>[] = [];
    addListener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn)
    }
}

//Project State Management, similar to other state management in libraries/frameworks
export class ProjectState extends State<Project> {
    private projects: Project[] = [];
    private static instance: ProjectState;
    private constructor() {
        super();
    }
    //ensuring only one instance of state is created and used, if not make one.
    static getInstance() {
        if (this.instance) {
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
            proj.status = newStatus;
            this.updateListeners();
        }
    }
    private updateListeners() {
        for (const listenerFn of this.listeners) {
            //slice is to return a copy of the original array
            listenerFn(this.projects.slice());
        }
    }
}
//create state
export const projectState = ProjectState.getInstance();