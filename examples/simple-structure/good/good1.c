#include <stdlib.h>

// Demonstrate the memory allocation calls and free
// Should be able to analyze it with no found errors
int main() {
    // malloc and free
    int *ptr = malloc(sizeof(int));
    free(ptr);

    // aligned_alloc (equivalent to malloc)
    ptr = aligned_alloc(4, sizeof(int));

    // realloc (eqvalent to free then malloc)
    ptr = realloc(ptr, sizeof(int) * 10);
    free(ptr);

    // calloc (equivalent to malloc)
    ptr = calloc(5, sizeof(int));

    // double free (fine with current scope)
    free(ptr);
    free(ptr);

    return 0;
}