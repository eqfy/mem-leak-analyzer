#include <stdlib.h>

// Pointer aliasing
// Should be able to analyze it with no found errors
int main() {
    int *ptr0 = malloc(sizeof(int));

    // ptr0 and ptr1 now both point to the same block
    int *ptr1 = ptr0;

    // free with either is acceptable
    free(ptr1);

    return 0;
}