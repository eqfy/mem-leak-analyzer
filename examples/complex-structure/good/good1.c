#include <stdlib.h>

// Recursion that allocates and frees in its own stack
// Ideally, should be able to analyze it with no found errors
void helper(int count) {
    int *ptr = malloc(sizeof(int));
    if (count != 0) {
        helper(count - 1);
    }
    free(ptr);
}

int main() {
    // recursively create a stack of depth 5 with each stack allocating and freeing on its own
    // even if this is -5, infinite recursion should not be of concern
    helper(5);

    return 0;
}

