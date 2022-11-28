#include <stdlib.h>

// Macro handling (just substitute in the expression)
// Should be able to analyze it with no found errors

#define A malloc(sizeof(int))

int main() {
    // allocate 2 blocks with macros
    int *ptr0 = A;
    int *ptr1 = A;

    // free the blocks
    free(ptr0);
    free(ptr1);

    return 0;
}