
//autobind decorator
// _ would normally be target, _2 would be methodname. these are hints to the tsc compiler that there is no need to use them, but are mandatory for the method
//this behavior can be turned off in the tsconfig settings.
export function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
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