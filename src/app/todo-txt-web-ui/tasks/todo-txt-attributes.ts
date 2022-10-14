export module TodoTxtAttributes {
    export var priorities: Set<string> = new Set<string>();
    export var projects: Set<string> = new Set<string>();
    export var contexts: Set<string> = new Set<string>();

    export function reset(): void {
        priorities = new Set<string>();
        projects = new Set<string>();
        contexts = new Set<string>();
    }
}
