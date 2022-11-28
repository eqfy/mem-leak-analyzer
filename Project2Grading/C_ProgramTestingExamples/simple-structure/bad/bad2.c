#include <stdlib.h>

// All allocated memory blocks should always have at least 1 pointer pointing to it
// Should be able to analyze it with a found leak on line 10
int main() {
    int *ptr0 = malloc(sizeof(int));
    int *ptr1 = malloc(sizeof(int));

    // memory block pointed by ptr0 now has no pointer pointing to it - 100% leak
    ptr0 = ptr1;

    free(ptr0);
    free(ptr1);

    return 0;
}