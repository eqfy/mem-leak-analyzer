#include <stdlib.h>

// Global variable handling (treated just as a variable with a global scope)
// Should be able to analyze it with no found errors

int *ptr;

int main() {
    // allocate 1 block
    ptr = malloc(sizeof(int));

    // free the block
    free(ptr);

    return 0;
}