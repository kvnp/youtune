export function decodeNestedURI(nestedURI: string): string {
    let oldURI = nestedURI;
    let newURI = null;
    let tries = 0;

    while (true) {
        tries++;
        newURI = decodeURIComponent(oldURI);
        
        if (newURI == oldURI) break;
        
        oldURI = newURI;
    }

    return newURI;
}